import test from "node:test";
import assert from "node:assert/strict";
import { emptyTrial, trialReducer, explanationFor, mainAnalysisResponses } from "../lib/trialLogic.ts";

test("AI reveal requires both explicit initial inputs and locks them afterward", () => {
  assert.equal(trialReducer(emptyTrial, { type: "reveal" }).stage, "initial");
  const decision = trialReducer(emptyTrial, { type: "initial", value: { decision: "normal" } });
  assert.equal(trialReducer(decision, { type: "reveal" }).stage, "initial");
  const ready = trialReducer(decision, { type: "initial", value: { confidence: 1 } });
  const revealed = trialReducer(ready, { type: "reveal" });
  assert.equal(revealed.stage, "assistance");
  assert.equal(trialReducer(revealed, { type: "initial", value: { decision: "anomaly", confidence: 5 } }), revealed);
  assert.equal(trialReducer(revealed, { type: "final", value: { decision: "anomaly" } }), revealed);
  const final = trialReducer(revealed, { type: "finalize" });
  assert.equal(trialReducer(final, { type: "submit" }).stage, "final");
  const answered = trialReducer(final, { type: "final", value: { decision: "anomaly", confidence: 5 } });
  assert.equal(trialReducer(answered, { type: "submit" }).stage, "submitted");
  assert.deepEqual(answered.initial, { decision: "normal", confidence: 1 });
});

test("confidence-only input and invalid confidence cannot reveal AI", () => {
  const confidenceOnly = trialReducer(emptyTrial, { type: "initial", value: { confidence: 3 } });
  assert.equal(trialReducer(confidenceOnly, { type: "reveal" }).stage, "initial");
  for (const confidence of [-1, 0, 6, 100, NaN, 2.5]) {
    const invalid = trialReducer(emptyTrial, { type: "initial", value: { decision: "normal", confidence } });
    assert.equal(trialReducer(invalid, { type: "reveal" }).stage, "initial");
  }
});

test("explanations follow AI prediction for TP, FP, TN, and FN", () => {
  for (const groundTruth of ["normal", "anomaly"]) {
    for (const group of ["none", "saliency", "counterfactual"]) {
      const stimulus = { id: "fixture", imagePath: "/fixture.svg", groundTruth, saliencyPath: "/saliency.svg", counterfactualPath: "/counterfactual.svg" };
      assert.equal(Boolean(explanationFor({ ...stimulus, aiPrediction: "normal" }, group)), group !== "none");
      assert.equal(Boolean(explanationFor({ ...stimulus, aiPrediction: "anomaly" }, group)), group !== "none");
      assert.equal(explanationFor(stimulus, group), null);
    }
  }
  assert.equal(explanationFor({ id: "missing", imagePath: "/fixture.svg", aiPrediction: "anomaly" }, "saliency"), null);
});

test("main analysis excludes practice", () => {
  assert.deepEqual(mainAnalysisResponses([{ is_practice: true }, { is_practice: false }]), [{ is_practice: false }]);
});

test("confidence requires an explicit integer rating from 1 to 5", () => {
 for (const rating of [1,2,3,4,5]) {
 const ready=trialReducer(emptyTrial,{type:"initial",value:{decision:"normal",confidence:rating}});
 assert.equal(trialReducer(ready,{type:"reveal"}).stage,"assistance");
 }
});
