import type { ExplanationGroup, TrialStimulus, TrialResponse } from "../types/trial";

export function explanationFor(stimulus: TrialStimulus, group: ExplanationGroup) {
  if (!stimulus.aiPrediction || group === "none") return null;
  const path = group === "saliency" ? stimulus.saliencyPath : stimulus.counterfactualPath;
  return path ? { type: group, path } : null;
}

export interface ResponseInput { decision: TrialResponse["initial_decision"] | null; confidence: number | null }
export type TrialState = { stage: "initial" | "assistance" | "final" | "submitted"; initial: ResponseInput; final: ResponseInput };
export const emptyTrial: TrialState = { stage: "initial", initial: { decision: null, confidence: null }, final: { decision: null, confidence: null } };
export function isComplete(input: ResponseInput): boolean {
  return (input.decision === "normal" || input.decision === "anomaly") && input.confidence !== null && Number.isInteger(input.confidence) && input.confidence >= 1 && input.confidence <= 5;
}
export type TrialAction = { type: "initial" | "final"; value: Partial<ResponseInput> } | { type: "reveal" | "finalize" | "submit" };
export function trialReducer(state: TrialState, action: TrialAction): TrialState {
  // The initial response is immutable after AI assistance is revealed.
  // Allowing edits here would invalidate the pre-AI baseline measurement.
  if (action.type === "initial" && state.stage === "initial") return { ...state, initial: { ...state.initial, ...action.value } };
  if (action.type === "reveal" && state.stage === "initial" && isComplete(state.initial)) return { ...state, stage: "assistance" };
  if (action.type === "finalize" && state.stage === "assistance") return { ...state, stage: "final", final: { decision: state.initial.decision, confidence: null } };
  if (action.type === "final" && state.stage === "final") return { ...state, final: { ...state.final, ...action.value } };
  if (action.type === "submit" && state.stage === "final" && isComplete(state.final)) return { ...state, stage: "submitted" };
  return state;
}
// Practice is retained separately and must never enter the main analysis export.
export function mainAnalysisResponses(responses: readonly TrialResponse[]) {
  return responses.filter(response => !response.is_practice);
}
