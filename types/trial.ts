export type Decision = "normal" | "anomaly";
export type ExplanationGroup = "none" | "saliency" | "counterfactual";
export interface TrialStimulus {
  id: string;
  imagePath: string;
  imageDescription?: string;
  sourceNote?: string;
  dataset?: string;
  datasetClass?: string;
  groundTruth?: Decision;
  difficulty?: "easy" | "medium" | "hard";
  aiPrediction?: Decision;
  aiCorrectness?: boolean;
  uncertaintyCondition?: "hidden" | "high" | "low";
  saliencyPath?: string;
  counterfactualPath?: string;
}
export interface TrialResponse {
  participant_id: string;
  prolific_pid: string | null;
  study_id: string | null;
  session_id: string | null;
  explanation_group: ExplanationGroup;
  trial_index: number;
  trial_id: string;
  image_id: string;
  is_practice: boolean;
  difficulty: TrialStimulus["difficulty"] | null;
  ground_truth: Decision | null;
  ai_prediction: Decision | null;
  ai_correctness: boolean | null;
  uncertainty_condition: TrialStimulus["uncertaintyCondition"] | null;
  ai_confidence_label: "high" | "low" | null;
  explanation_available: boolean;
  explanation_type: ExplanationGroup;
  initial_decision: Decision;
  initial_confidence: number;
  final_decision: Decision;
  final_confidence: number;
  decision_switched: boolean;
  created_at: string;
  submitted_at: string;
}
