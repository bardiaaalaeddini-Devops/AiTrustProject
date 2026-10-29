import type { TrialStimulus } from "../types/trial";

// The photo is from MVTec Screws, not MVTec AD. It has no anomaly label here.
// AI conditions remain hand-authored interface fixtures, not model outputs.
// Fixed order is intentional: final randomization and balancing await real stimuli.
const photo = {
  imagePath: "/demo-stimuli/screws_001.png",
  dataset: "MVTec Screws v1.1 (development preview only)",
  imageDescription: "Photograph of screws and nuts on a wooden background",
  sourceNote: "MVTec Screws photo — development preview only; anomaly ground truth unavailable. Source: MVTec Software GmbH, CC BY-NC-SA 4.0."
};
export const demoStimuli: readonly TrialStimulus[] = [
  { ...photo, id: "demo-practice", aiPrediction: "normal", uncertaintyCondition: "hidden" },
  { ...photo, id: "demo-main", aiPrediction: "anomaly", uncertaintyCondition: "low", saliencyPath: "/demo-stimuli/saliency.svg", counterfactualPath: "/demo-stimuli/counterfactual.svg" }
];

// Twelve interface fixtures; replace with twelve validated dataset/model records.
export const mainStimuli: readonly TrialStimulus[] = Array.from({ length: 12 }, (_, index) => ({ ...demoStimuli[1], id: `main-${index + 1}` }));
