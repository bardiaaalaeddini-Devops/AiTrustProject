CREATE TABLE IF NOT EXISTS participants (
 id TEXT PRIMARY KEY, prolific_pid TEXT, study_id TEXT, session_id TEXT,
 explanation_group TEXT NOT NULL CHECK(explanation_group IN ('none','saliency','counterfactual')),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed')),
 started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMPTZ,
 UNIQUE(study_id, session_id), UNIQUE(study_id, prolific_pid)
);
CREATE TABLE IF NOT EXISTS stimuli (
 id TEXT PRIMARY KEY, dataset TEXT, dataset_class TEXT, image_path TEXT NOT NULL,
 ground_truth TEXT CHECK(ground_truth IN ('normal','anomaly')), difficulty TEXT,
 ai_prediction TEXT NOT NULL CHECK(ai_prediction IN ('normal','anomaly')),
 uncertainty TEXT, ai_confidence_label TEXT, saliency_path TEXT, counterfactual_path TEXT,
 version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS participant_trials (
 id TEXT PRIMARY KEY, participant_id TEXT NOT NULL REFERENCES participants(id),
 stimulus_id TEXT NOT NULL REFERENCES stimuli(id), trial_number INTEGER NOT NULL CHECK(trial_number BETWEEN 1 AND 12),
 is_practice INTEGER NOT NULL DEFAULT 0 CHECK(is_practice IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','ai_reviewed','completed')),
 started_at TIMESTAMPTZ, ai_reviewed_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
 UNIQUE(participant_id, is_practice, trial_number)
);
CREATE TABLE IF NOT EXISTS trial_responses (
 id TEXT PRIMARY KEY, participant_trial_id TEXT NOT NULL UNIQUE REFERENCES participant_trials(id),
 initial_decision TEXT NOT NULL CHECK(initial_decision IN ('normal','anomaly')),
 initial_confidence INTEGER NOT NULL CHECK(initial_confidence BETWEEN 0 AND 100),
 final_decision TEXT CHECK(final_decision IN ('normal','anomaly')),
 final_confidence INTEGER CHECK(final_confidence BETWEEN 0 AND 100),
 decision_switched INTEGER GENERATED ALWAYS AS (CASE WHEN final_decision IS NULL THEN NULL ELSE (initial_decision != final_decision)::integer END) STORED,
 initial_submitted_at TIMESTAMPTZ NOT NULL, final_submitted_at TIMESTAMPTZ,
 CHECK((final_decision IS NULL AND final_confidence IS NULL AND final_submitted_at IS NULL) OR
       (final_decision IS NOT NULL AND final_confidence IS NOT NULL AND final_submitted_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS questionnaire_items (
 id TEXT PRIMARY KEY, construct TEXT NOT NULL, question_text TEXT NOT NULL,
 scale_min INTEGER NOT NULL, scale_max INTEGER NOT NULL, applicable_group TEXT,
 CHECK(scale_min < scale_max), CHECK(applicable_group IS NULL OR applicable_group IN ('none','saliency','counterfactual'))
);
CREATE TABLE IF NOT EXISTS questionnaire_answers (
 id TEXT PRIMARY KEY, participant_id TEXT NOT NULL REFERENCES participants(id),
 question_id TEXT NOT NULL REFERENCES questionnaire_items(id), answer INTEGER NOT NULL,
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(participant_id, question_id)
);
CREATE OR REPLACE FUNCTION validate_questionnaire_answer() RETURNS trigger AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM questionnaire_items q JOIN participants p ON p.id = NEW.participant_id
 WHERE q.id = NEW.question_id AND NEW.answer BETWEEN q.scale_min AND q.scale_max
 AND (q.applicable_group IS NULL OR q.applicable_group = p.explanation_group)) THEN
 RAISE EXCEPTION 'Invalid questionnaire answer';
 END IF;
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS validate_questionnaire_answer ON questionnaire_answers;
CREATE TRIGGER validate_questionnaire_answer BEFORE INSERT OR UPDATE ON questionnaire_answers
 FOR EACH ROW EXECUTE FUNCTION validate_questionnaire_answer();
CREATE INDEX IF NOT EXISTS participant_trials_participant_idx ON participant_trials(participant_id);
CREATE INDEX IF NOT EXISTS participant_trials_stimulus_idx ON participant_trials(stimulus_id);

-- A separate durable rotation per Prolific study; demos never consume live slots.
CREATE TABLE IF NOT EXISTS assignment_counters (
 scope TEXT PRIMARY KEY,
 next_position BIGINT NOT NULL DEFAULT 0 CHECK(next_position >= 0)
);

-- Existing research scores retain their original 0-100 scale.
ALTER TABLE trial_responses ADD COLUMN IF NOT EXISTS initial_confidence_scale INTEGER NOT NULL DEFAULT 100;
ALTER TABLE trial_responses ADD COLUMN IF NOT EXISTS final_confidence_scale INTEGER NOT NULL DEFAULT 100;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='trial_responses'::regclass AND conname='trial_response_confidence_scales') THEN
 ALTER TABLE trial_responses ADD CONSTRAINT trial_response_confidence_scales CHECK (
 initial_confidence_scale IN (5,100) AND final_confidence_scale IN (5,100)
 AND initial_confidence BETWEEN CASE WHEN initial_confidence_scale=5 THEN 1 ELSE 0 END AND initial_confidence_scale
 AND (final_confidence IS NULL OR final_confidence BETWEEN CASE WHEN final_confidence_scale=5 THEN 1 ELSE 0 END AND final_confidence_scale));
 END IF;
END $$;
