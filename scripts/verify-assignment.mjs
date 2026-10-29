import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const origin=process.env.TEST_STUDY_ORIGIN || "http://localhost:3001";
const fresh=()=>randomBytes(12).toString("hex");
const study=fresh(), groups=["none","saliency","counterfactual"];
const launch=()=>({PROLIFIC_PID:fresh(),STUDY_ID:study,SESSION_ID:fresh()});
async function start(query,extra={},status=200){
 const response=await fetch(`${origin}/api/study`,{method:"POST",headers:{Origin:origin,"Content-Type":"application/json"},body:JSON.stringify({action:"start",query,...extra})});
 const result=await response.json();assert.equal(response.status,status,JSON.stringify(result));return result;
}
const firstQuery=launch();
await start(firstQuery,{group:"counterfactual"},400);
const first=await start(firstQuery);assert.equal(first.participant.explanation_group,"none");
const repeated=await Promise.all(Array.from({length:5},()=>start(firstQuery)));
assert.ok(repeated.every(s=>s.participant.id===first.participant.id));
const assigned=[first.participant.explanation_group];
for(let i=1;i<10;i++){
 const result=await start(launch());assigned.push(result.participant.explanation_group);
 assert.equal(result.participant.explanation_group,groups[i%3]);
}
const concurrent=await Promise.all(Array.from({length:9},()=>start(launch())));
for(const group of groups)assert.equal(concurrent.filter(s=>s.participant.explanation_group===group).length,3);
assert.equal(new Set(concurrent.map(s=>s.participant.id)).size,9);
const resumed=await start(firstQuery);assert.equal(resumed.participant.id,first.participant.id);assert.equal(resumed.participant.explanation_group,"none");
const twentieth=await start(launch());assert.equal(twentieth.participant.explanation_group,"saliency");
const separate=await start({...launch(),STUDY_ID:fresh()});assert.equal(separate.participant.explanation_group,"none");
console.log("PASS: ten participants:",assigned.join(" -> "));
console.log("PASS: concurrent starts, duplicate enrollment, resume stability, rejected overrides, and independent study rotations.");
