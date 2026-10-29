import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const origin=process.env.TEST_STUDY_ORIGIN || "http://localhost:3001";
let cookie="";
async function send(body,expected=200){
 const response=await fetch(`${origin}/api/study`,{method:"POST",headers:{Origin:origin,"Content-Type":"application/json",Cookie:cookie},body:JSON.stringify(body)});
 const result=await response.json();assert.equal(response.status,expected,JSON.stringify(result));
 if(response.headers.get("set-cookie"))cookie=response.headers.get("set-cookie").split(";")[0];return result;
}
const query={PROLIFIC_PID:randomBytes(12).toString("hex"),STUDY_ID:randomBytes(12).toString("hex"),SESSION_ID:randomBytes(12).toString("hex")};
let state=await send({action:"start",query});assert.equal(state.trials.length,12);assert.equal(state.trials[0].ai_prediction,undefined);
const group=state.participant.explanation_group;
const starts=await Promise.all(Array.from({length:4},()=>send({action:"start",query})));
assert.ok(starts.every(result=>result.participant.id===state.participant.id));
await send({action:"respond",trialId:state.trials[1].id,stage:"initial",value:{decision:"normal",confidence:3}},400);
await send({action:"respond",trialId:state.trials[0].id,stage:"final",value:{decision:"normal",confidence:3}},400);
for(const confidence of [0,6,2.5]) {
await send({action:"respond",trialId:state.trials[0].id,stage:"initial",value:{decision:"normal",confidence}},400);
}
for(let i=0;i<12;i++){
 const id=state.trials[i].id;
 await Promise.all(Array.from({length:3},()=>send({action:"respond",trialId:id,stage:"initial",value:{decision:"normal",confidence:2}})));
 state=await send({action:"respond",trialId:id,stage:"initial",value:{decision:"normal",confidence:2}});assert.ok(state.ai.ai_prediction);assert.equal(state.trials[i].initial_confidence_scale,5);
 const resumed=await send({action:"start",query});assert.equal(resumed.participant.explanation_group,group);assert.equal(resumed.trials[i].status,"ai_reviewed");
 state=await send({action:"respond",trialId:id,stage:"initial",value:{decision:"anomaly",confidence:5}});assert.equal(state.trials[i].initial_decision,"normal");
 state=await send({action:"respond",trialId:id,stage:"final",value:{decision:"anomaly",confidence:4}});assert.equal(state.trials[i].status,"completed");assert.equal(state.trials[i].final_confidence_scale,5);
 if(i<11)assert.equal(state.participant.status,"active");
 state=await send({action:"respond",trialId:id,stage:"final",value:{decision:"normal",confidence:1}});assert.equal(state.trials[i].final_confidence,4);
}
assert.equal(state.participant.status,"completed");
cookie="";const resumed=await send({action:"start",query});assert.equal(resumed.participant.status,"completed");assert.equal(resumed.trials.length,12);
console.log("PASS: concurrent enrollment/submission, 12 trials, immutable initial/final answers, stage/order validation, retry safety, assignment and database resume, completion.");
