# Implementation notes

## Study flow
Welcome -> Informed Consent (next milestone) -> Instructions -> Practice -> 12 Trials -> Post-study Questionnaire -> Completion -> Prolific.

## Design notes
- Explanation condition is assigned per participant, not per trial.
- Saliency and counterfactual information are shown only if the AI predicts an anomaly.
- No trial stimulus, ground truth or AI prediction is shown in Welcome.
- Trial stimuli and ML outputs are precomputed and fixed for reproducibility.
- Avoid sharing Prolific IDs with analytics or any external service.

## Integration notes
- Parse study URL parameters on entry.
- Do not record participant IDs until the consent and backend logic has been approved.
- Tie participant assignment to a server-side session after consent.
- Restrict database and stimulus-access permissions as appropriate for a live study.
- Return to Prolific only after a successfully recorded completion.
