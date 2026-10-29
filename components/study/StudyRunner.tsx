"use client";
import { useState } from "react";
import { consentParagraphs, comprehensionQuestions } from "../../data/studyContent";
import type { StudyLaunch } from "../../types/participant";
import { Questionnaire } from "./Questionnaire";

type Step = "consent" | "exit" | "instructions" | "comprehension" | "main";
export function StudyRunner({ launch }: { launch: StudyLaunch }) {
  const [step, setStep] = useState<Step>("consent");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const passed = comprehensionQuestions.every(question => answers[question.id] === question.correct);
  function consent() {
    setStep("instructions");
  }
  return <main className="study-shell"><header className="topbar"><strong>Quality Inspection Study</strong><span className="research-label">FRONTEND PROTOTYPE</span></header><article className="study-card" key={step}>
    {step === "consent" && <><h1>Informed consent</h1>{consentParagraphs.map(text => <p key={text}>{text}</p>)}<div className="actions"><button className="primary" onClick={consent}>I consent and wish to continue</button><button onClick={() => setStep("exit")}>I do not consent</button></div></>}
    {step === "exit" && <><h1>You have not consented</h1><p>You will not enter the experiment. You may close this page. If you arrived through Prolific, return to your submission page for return instructions.</p></>}
    {step === "instructions" && <><h1>Instructions</h1><p>You are acting as a quality inspector. Inspect each industrial image and classify the item as Normal or Anomalous.</p><p>First make your own judgment and provide your confidence. Selecting “Review AI answer” locks that response.</p><p>Then review assistance from an AI system. The AI can make correct or incorrect predictions. Make your final decision and provide your confidence after reviewing the assistance. You may keep or change your initial decision. The final decision belongs to you.</p><p>You will answer 12 questions in one assigned set. For each question, record your decision and confidence, select Review AI answer, then submit your final decision and confidence. Select Next question to continue. You will not move to another set. AI outputs in this preview are simulated.</p><button className="primary" onClick={() => setStep("comprehension")}>Continue to comprehension check</button></>}
    {step === "comprehension" && <><h1>Comprehension check</h1>{comprehensionQuestions.map(question => <fieldset key={question.id}><legend>{question.prompt}</legend>{question.options.map(option => <label className="radio-option" key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option }))} />{option}</label>)}</fieldset>)}{attempted && !passed && <p role="alert">Review your answers: you make the final decision, and the AI can make errors.</p>}<button className="primary" onClick={() => { setAttempted(true); if (passed) setStep("main"); }}>Begin questions</button></>}
    {step === "main" && <Questionnaire launch={launch} />}

  </article></main>;
}

