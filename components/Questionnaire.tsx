"use client";

import { useRef, useState } from "react";

type Answer = { decision: "normal" | "anomalous"; confidence: number };
const sets = ["Metal components", "Surface inspection", "Circuit inspection"];

function Stimulus({ set, trial }: { set: number; trial: number }) {
  const defect = [1, 4, 6, 9, 11].includes(trial);
  return <svg viewBox="0 0 600 360" role="img" aria-label={`Illustrative inspection sample ${trial + 1}, ${sets[set]}`}>
    <defs><linearGradient id="metal" x2="1" y2="1"><stop stopColor="#eef2f6"/><stop offset="1" stopColor="#99a8b8"/></linearGradient></defs>
    <rect width="600" height="360" rx="18" fill="#e8edf2"/>
    {set === 0 && <g transform={`rotate(${(trial % 3 - 1) * 12} 300 180)`}><rect x="170" y="65" width="260" height="230" rx="30" fill="url(#metal)" stroke="#708399" strokeWidth="3"/><circle cx="300" cy="180" r="65" fill="#718399"/><circle cx="300" cy="180" r="38" fill="#e8edf2"/>{[190,410].map(x => [85,275].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill="#62758b"/>))}{defect && <path d={`M205 120l25 20-12 22 30 24${trial % 2 ? ' 12 20' : ''}`} fill="none" stroke="#475365" strokeWidth="4"/>}</g>}
    {set === 1 && <g><rect x="120" y="45" width="360" height="270" rx="8" fill="#c9b59b"/>{Array.from({length:18},(_,i)=><path key={i} d={`M120 ${55+i*15} Q300 ${40+i*15} 480 ${55+i*15}`} fill="none" stroke="#b39b7c" strokeWidth="2"/>)}{defect && <ellipse cx={220 + trial * 8} cy="170" rx={14 + trial} ry="28" fill="#6e6254"/>}</g>}
    {set === 2 && <g><rect x="120" y="45" width="360" height="270" rx="14" fill="#436e65"/>{Array.from({length:6},(_,i)=><path key={i} d={`M140 ${75+i*40}h80v20h220`} stroke="#a8b98a" strokeWidth="4" fill="none"/>)}{[180,290,400].map(x=><g key={x}><rect x={x} y="120" width="40" height="90" fill="#273c3d"/>{[130,150,170,190].map(y=><path key={y} d={`M${x-10} ${y}h10m40 0h10`} stroke="#d2d6c9" strokeWidth="4"/>)}</g>)}{defect && <path d="M330 225l35-25 20 35" stroke="#e8edf2" strokeWidth="8" fill="none"/>}</g>}
  </svg>;
}

export function Questionnaire() {
  const [screen, setScreen] = useState<"intro" | "trial" | "review" | "complete">("intro");
  const [set, setSet] = useState(0);
  const [trial, setTrial] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const index = set * 12 + trial;
  const answer = answers[index];
  function navigate(next: typeof screen, nextTrial = trial) {
    setTrial(nextTrial); setScreen(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function update(patch: Partial<Answer>) {
    setAnswers(previous => ({...previous, [index]: {...previous[index], ...patch} as Answer}));
  }
  function download() {
    const payload = { mode: "illustrative-preview", sets: sets.map((name,s) => ({name, answers: Array.from({length:12},(_,t)=>({trial:t+1,...answers[s*12+t]}))})) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const link = document.createElement("a"); link.href=url; link.download="inspection-preview-answers.json"; link.click(); URL.revokeObjectURL(url);
  }
  return <main className="site-shell questionnaire-shell">
    <header className="topbar"><div className="brand-lockup">AI Quality Inspection</div><span className="research-label">QUESTIONNAIRE PREVIEW</span></header>
    <section className="questionnaire-content">
      <nav className="set-tabs" aria-label="Inspection sets">{sets.map((name,s)=><span key={name} aria-current={s===set ? "step" : undefined} className={s===set ? "active" : ""}>Set {s+1} <small>{name}</small></span>)}</nav>
      {screen === "intro" && <section className="question-panel"><span className="small-tag">3 SETS · 12 QUESTIONS EACH</span><h1 ref={heading} tabIndex={-1}>Inspect. Decide. Continue.</h1><p>Inspect each sample and decide whether the item looks normal or contains an anomaly, such as damage, an irregular mark, or a broken connection. Then rate your confidence from 1 (very unsure) to 5 (very confident).</p><p>You can review and change answers before continuing to the next set. These illustrations demonstrate the interface; real study images and AI outputs have not been configured.</p><button className="study-primary" onClick={()=>navigate("trial",0)}>Start set 1 →</button></section>}
      {screen === "trial" && <>
        <div className="trial-heading"><div><span className="small-tag">SET {set+1} OF 3</span><h1 ref={heading} tabIndex={-1}>{sets[set]}</h1></div><span>Question {trial+1} / 12</span></div>
        <progress value={Object.values(answers).filter(a=>a.decision && a.confidence).length} max={36} aria-label="Questions answered"/>
        <div className="inspection-grid"><figure className="stimulus-panel"><Stimulus set={set} trial={trial}/></figure>
          <form className="question-panel" onSubmit={event=>{event.preventDefault(); navigate(trial===11 ? "review" : "trial", trial===11 ? trial : trial+1);}}>
            <fieldset><legend>Is this item normal or anomalous?</legend>{(["normal","anomalous"] as const).map(value=><label className={`answer-option ${answer?.decision===value ? "selected" : ""}`} key={value}><input type="radio" name="decision" value={value} checked={answer?.decision===value} onChange={()=>update({decision:value})} required/><span>{value === "normal" ? "Normal" : "Anomalous"}<small>{value === "normal" ? "No visible defect" : "A visible defect or irregularity"}</small></span></label>)}</fieldset>
            <fieldset><legend>How confident are you?</legend><div className="confidence-options">{[1,2,3,4,5].map(value=><label key={value}><input type="radio" name="confidence" value={value} checked={answer?.confidence===value} onChange={()=>update({confidence:value})} required/><span>{value}</span></label>)}</div><div className="confidence-labels"><span>Very unsure</span><span>Very confident</span></div></fieldset>
            <div className="study-actions"><button type="button" className="study-secondary" disabled={trial===0} onClick={()=>navigate("trial",trial-1)}>Back</button><button className="study-primary" disabled={!answer?.decision || !answer?.confidence}>{trial===11 ? "Review set" : "Next question"} →</button></div>
          </form></div>
      </>}
      {screen === "review" && <section className="question-panel"><span className="small-tag">SET {set+1} · ANSWER REVIEW</span><h1 ref={heading} tabIndex={-1}>Review your 12 decisions</h1><p>Select a question to change your answer.</p><div className="review-grid">{Array.from({length:12},(_,t)=><button className="review-answer" key={t} onClick={()=>navigate("trial",t)}><strong>Question {t+1}</strong><span>{answers[set*12+t]?.decision ?? "Unanswered"}</span><small>Confidence: {answers[set*12+t]?.confidence ?? "—"} / 5</small></button>)}</div><button className="study-primary" disabled={!Array.from({length:12},(_,t)=>answers[set*12+t]).every(a=>a?.decision && a?.confidence)} onClick={()=>{if(set===2) navigate("complete"); else {setSet(set+1);navigate("trial",0);}}}>{set===2 ? "Finish preview" : `Continue to set ${set+2}`} →</button></section>}
      {screen === "complete" && <section className="question-panel"><span className="small-tag">36 OF 36 ANSWERED</span><h1 ref={heading} tabIndex={-1}>All three sets are complete.</h1><p>Your preview answers are ready to download. They have not been submitted to a server or to Prolific.</p><div className="study-actions"><button className="study-secondary" onClick={()=>navigate("review")}>Review final set</button><button className="study-primary" onClick={download}>Download answers</button></div></section>}
    </section><footer className="footer"><span>Academic research prototype</span><span>3 sets · 36 inspections</span></footer>
  </main>;
}
