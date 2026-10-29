# One group, twelve trials

This repository now includes the twelve-question implementation previously edited in the separately running project copy.

Each participant receives exactly one explanation group in repeating enrollment order: none -> saliency -> counterfactual -> none. No participant or demo group selector exists; the API rejects group overrides. Each Prolific study has its own PostgreSQL assignment counter, with a separate counter for demos. Assignment happens when the participant begins the questions after consent/comprehension. Returning participants retain their group without advancing the counter. Enrollment and the counter update share a transaction: simultaneous participants get consecutive slots; failed enrollment does not consume one. Existing participant groups and responses are preserved. On first use after migration, a counter starts at the count of existing participants in that study (or demos), then continues the rotation. Historical random assignments are not rewritten.

Flow: consent -> instructions -> comprehension -> 12 main questions -> completion. Each question requires initial classification and explicit confidence, Review AI answer, final classification and explicit post-AI confidence, Submit final answer, then Next question. The initial answer is locked at AI review. The final decision defaults to the initial decision but may be changed. A participant never continues to another group. No practice is currently inserted.

## Database

PostgreSQL schema: database/schema.sql. Server operations: lib/studyStore.ts. API: app/api/study/route.ts. The app uses pg connection pooling and server-only DATABASE_URL from .env.local. Run npm run db:migrate to install/update the schema. PostgreSQL 17 binaries and the local data cluster are installed under .local/ in this repository, excluded from Git. The server listens only on 127.0.0.1:5432 and uses SCRAM password authentication. Application credentials are separate from the administrator credentials; the application role has no cluster superuser privileges.

Run npm run db:start after reboot before starting the app. npm run db:status checks the server; npm run db:stop shuts it down cleanly. The second project copy shares DATABASE_URL, but local-server commands must be run in this repository, where the binaries are installed. Use a managed PostgreSQL connection and its required TLS settings on production hosting. Back up production data with pg_dump or provider backups.

The migration script imports an existing SQLite file read-only using Node.js 24, runs in a PostgreSQL transaction, and verifies every imported field before committing. Run npm run db:import-sqlite -- <source.sqlite>. The original source is preserved. Do not import integration.sqlite into the research database; that file contains generated automated tests. PostgreSQL tables use TIMESTAMPTZ for actual timestamps. Existing SQLite timestamps are interpreted as UTC.

participants: one row per study participant, with Prolific IDs, stable assignment and completion status. Uniqueness within a study prevents duplicate enrollment. A matching launch resumes the existing session. An HTTP-only same-site cookie identifies subsequent requests. Demo sessions resume in the same browser.

stimuli: versioned image and model metadata, including optional ground truth. AI correctness is derived from prediction and known ground truth rather than duplicated. Unknown ground truth remains NULL.

participant_trials: one scheduled stimulus per numbered trial, with unique participant/practice/trial number, state and AI-review/completion timestamps. Trial count is validated by the application as twelve.

trial_responses: exactly one response per scheduled trial. Initial values are immutable through the API. Final values are only accepted after AI review. decision_switched is computed by the database. New confidence answers are explicit integer ratings from 1 to 5, both before and after AI review. A slider has five fixed positions, with visible 1-5 ticks. Its initial midpoint is only a visual position; a click, drag, or keyboard change is required to record a rating. Separate initial_confidence_scale and final_confidence_scale fields record 5 for new submissions and 100 for historical scores. Historical responses are not rescaled; even an older trial finished after the change retains its original initial scale and records the new final rating with scale 5. Retries return existing saved results, without overwriting them.

questionnaire_items and questionnaire_answers: reserved for separate psychometric questions, not the image trials. No post-study questionnaire is added to the new twelve-question flow. Scales and group applicability are validated on insert; edits/versioning need a migration before use.

API enforces trial order and validates confidence/stages server-side. Writes are transactional. Participant row locks serialize concurrent response submissions; advisory locks serialize enrollment for the same study/participant. AI data is returned on the initial submission/review request, not on the initial image listing. Responses are saved incrementally; refreshing and returning through consent/comprehension resumes the first unfinished trial. Reloading a completed set shows completion. Failed writes keep the participant on the question with a retryable error.

## Assets and remaining setup

The twelve records currently reuse the existing photograph and hand-authored model result. Saliency/counterfactual images remain explicitly labeled placeholders. Replace these with twelve validated stimuli and genuine explanation outputs; use a new stimulus version/ID rather than altering records already used by participants. Explanation groups display their available asset for either AI prediction class. The no-explanation group displays only the AI result.

Prolific completion redirect is not configured by this change. Supply the actual study completion URL in a separate integration step. No automatic payment or Prolific API operation is performed. Consent remains an ethics draft and must be finalized before recruitment.
