"use client";
import { useEffect, useRef, useState } from "react";
import type { StudyLaunch } from "../../types/participant";
import type { Decision, ExplanationGroup } from "../../types/trial";
import { ConfidenceRating, DecisionButtons } from "./Trial";
type SavedTrial = {id:string;trial_number:number;status:string;image_path:string;initial_decision:Decision|null;initial_confidence:number|null;initial_confidence_scale:5|100|null;final_decision:Decision|null;final_confidence:number|null;final_confidence_scale:5|100|null};
type Snapshot = {participant:{explanation_group:ExplanationGroup;status:string};trials:SavedTrial[]};
type AI = {ai_prediction:Decision;saliency_path:string|null;counterfactual_path:string|null};
export function Questionnaire({launch}:{launch:StudyLaunch}) {
 const initialized=useRef(false);
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 const [index,setIndex]=useState(0);
 const [decision,setDecision]=useState<Decision|null>(null);
 const [confidence,setConfidence]=useState<number|null>(null);
 const [finalDecision,setFinalDecision]=useState<Decision|null>(null);
 const [finalConfidence,setFinalConfidence]=useState<number|null>(null);
 const [ai,setAI]=useState<AI|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [finished,setFinished]=useState(false);
 async function request(body:object) {
 const response=await fetch("/api/study",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw Error(data.error || "Unable to save. Please retry.");return data;
 }
 async function load() {
 setBusy(true);setError("");
 try {
 const ids=launch.identifiers;
 const data=await request({action:"start",query:ids?{PROLIFIC_PID:ids.prolificPid,STUDY_ID:ids.studyId,SESSION_ID:ids.sessionId}:{demo:"1"}});
 setSnapshot(data);const next=data.trials.findIndex((t:SavedTrial)=>t.status!=="completed");
 if(next<0)setFinished(true);else {setIndex(next);setDecision(data.trials[next].initial_decision);setConfidence(data.trials[next].initial_confidence);}
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 useEffect(()=>{if(!initialized.current){initialized.current=true;void load();}},[]);
 const trial=snapshot?.trials[index];
 async function save(stage:"initial"|"final") {
 if(!trial)return;setBusy(true);setError("");
 try {
 const data=await request({action:"respond",trialId:trial.id,stage,value:stage==="initial"?{decision,confidence}:{decision:finalDecision,confidence:finalConfidence}});
 setSnapshot(data);if(stage==="initial"){setAI(data.ai);setFinalDecision(trial.initial_decision ?? decision);}
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 function next() {
 if(trial?.status!=="completed")return;
 if(index===11){setFinished(true);return;}
 setIndex(index+1);setDecision(null);setConfidence(null);setFinalDecision(null);setFinalConfidence(null);setAI(null);setError("");
 window.scrollTo({top:0,behavior:"smooth"});
 }
 if(!snapshot)return <section><h1>Preparing your questions</h1>{error?<><p role="alert">{error}</p><button onClick={load} disabled={busy}>Retry</button></>:<p>Loading your study session…</p>}</section>;
 if(finished)return <section><h1>Thank you. Your questions are complete.</h1><p>All 12 responses have been saved. You have completed your assigned set.</p></section>;
 if(!trial)return null;
 const locked=trial.status!=="pending";
 const path=snapshot.participant.explanation_group==="saliency"?ai?.saliency_path:ai?.counterfactual_path;
 return <section><span className="small-tag">QUESTION {index+1} OF 12</span><h1>Inspect the item</h1><progress value={index} max={12} aria-label="Questions completed"/><div className="trial-layout"><figure className="stimulus"><img src={trial.image_path} alt="Item to inspect for anomalies"/></figure><div>
 <section><h2>Your initial answer</h2>{locked?<p>Answer recorded: <strong>{trial.initial_decision==="normal"?"Normal":"Anomalous"}</strong> · Confidence {trial.initial_confidence}/{trial.initial_confidence_scale ?? 100}</p>:<><DecisionButtons value={decision} onChange={setDecision}/><ConfidenceRating id="before-ai-confidence" value={confidence} onChange={setConfidence}/></>}
 {!ai && trial.status!=="completed" && <button className="primary" disabled={busy||!decision||confidence===null} onClick={()=>save("initial")}>{busy?"Saving…":"Review AI answer"}</button>}</section>
 {ai && <><section className="ai-panel"><h2>AI answer</h2><p>Model result: <strong>{ai.ai_prediction==="normal"?"Normal":"Anomalous"}</strong></p>{snapshot.participant.explanation_group!=="none" && <figure><figcaption>{snapshot.participant.explanation_group==="saliency"?"Saliency map":"Counterfactual"} · demonstration placeholder</figcaption>{path?<img src={path} alt="Demonstration explanation placeholder"/>:<p>Explanation unavailable for this image.</p>}</figure>}</section>
 {trial.status!=="completed" && <section><h2>After reviewing the AI answer</h2><p>You may keep or change your decision. How certain are you now?</p><DecisionButtons value={finalDecision} onChange={setFinalDecision}/><ConfidenceRating id="after-ai-confidence" value={finalConfidence} onChange={setFinalConfidence}/><button className="primary" disabled={busy||!finalDecision||finalConfidence===null} onClick={()=>save("final")}>{busy?"Saving…":"Submit final answer"}</button></section>}</>}
 {trial.status==="completed" && <section><p role="status">Final answer saved: {trial.final_decision==="normal"?"Normal":"Anomalous"} · Confidence {trial.final_confidence}/{trial.final_confidence_scale ?? 100}</p><button className="primary" onClick={next}>{index===11?"Finish questionnaire":"Next question"}</button></section>}
 {error&&<p role="alert">{error}</p>}
 </div></div></section>;
}
