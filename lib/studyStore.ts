import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { mainStimuli } from "../data/demoStimuli";
import { isComplete } from "./trialLogic";
import type { StudyLaunch } from "../types/participant";

const globalDatabase = globalThis as unknown as { studyPool?: Pool };
function pool() {
 if (!process.env.DATABASE_URL) throw Error("DATABASE_URL must be configured");
 return globalDatabase.studyPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
}
async function database() {
 const client = await pool().connect();
 return {
 exec: (sql: string) => client.query(sql),
 close: () => client.release(),
 prepare: (sql: string) => {
 let index = 0;
 const text = sql.replace(/\?/g, () => `$${++index}`);
 return {
 get: async (...values: unknown[]) => (await client.query(text, values)).rows[0],
 all: async (...values: unknown[]) => (await client.query(text, values)).rows,
 run: async (...values: unknown[]) => client.query(text, values)
 };
 }
 };
}
export async function startStudy(launch: StudyLaunch) {
 const db = await database();
 try {
 await db.exec("BEGIN");
 const ids = launch.identifiers;
 if (ids) await db.prepare("SELECT pg_advisory_xact_lock(hashtextextended(?,0))").run(`${ids.studyId}:${ids.prolificPid}`);
 let participant = ids ? await db.prepare("SELECT * FROM participants WHERE study_id = ? AND session_id = ? AND prolific_pid = ?").get(ids.studyId, ids.sessionId, ids.prolificPid) : undefined;
 if (!participant) {
 const id = randomUUID();
 // Counter updates roll back with enrollment and serialize simultaneous starts.
 // Seed once from existing participants without changing their saved groups.
 const scope = ids ? `study:${ids.studyId}` : "demo";
 await db.prepare(`INSERT INTO assignment_counters(scope,next_position)
 SELECT ?,count(*) FROM participants WHERE study_id IS NOT DISTINCT FROM ?
 ON CONFLICT (scope) DO NOTHING`).run(scope,ids?.studyId ?? null);
 const allocation = await db.prepare(`UPDATE assignment_counters SET next_position=next_position+1
 WHERE scope=? RETURNING next_position-1 AS position`).get(scope);
 const group = (["none", "saliency", "counterfactual"] as const)[Number(BigInt(allocation.position) % BigInt(3))];
 await db.prepare("INSERT INTO participants(id,prolific_pid,study_id,session_id,explanation_group) VALUES(?,?,?,?,?)").run(id, ids?.prolificPid ?? null, ids?.studyId ?? null, ids?.sessionId ?? null, group);
 for (const [i,s] of mainStimuli.entries()) {
 await db.prepare("INSERT INTO stimuli(id,dataset,image_path,ai_prediction,saliency_path,counterfactual_path) VALUES(?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING").run(s.id,s.dataset ?? null,s.imagePath,s.aiPrediction!,s.saliencyPath ?? null,s.counterfactualPath ?? null);
 await db.prepare("INSERT INTO participant_trials(id,participant_id,stimulus_id,trial_number,started_at) VALUES(?,?,?,?,?)").run(randomUUID(),id,s.id,i+1,i===0 ? new Date().toISOString() : null);
 }
 participant = await db.prepare("SELECT * FROM participants WHERE id = ?").get(id);
 }
 await db.exec("COMMIT");
 return participant!;
 } catch(error) { await db.exec("ROLLBACK"); throw error; } finally { db.close(); }
}
export async function studyState(id: string) {
 const db = await database();
 try {
 const participant = await db.prepare("SELECT id,explanation_group,status FROM participants WHERE id=?").get(id);
 if (!participant) throw Error("Session not found");
 const trials = await db.prepare(`SELECT t.id,t.trial_number,t.status,s.image_path,r.initial_decision,r.initial_confidence,r.initial_confidence_scale,r.final_decision,r.final_confidence,r.final_confidence_scale
 FROM participant_trials t JOIN stimuli s ON s.id=t.stimulus_id LEFT JOIN trial_responses r ON r.participant_trial_id=t.id
 WHERE t.participant_id=? ORDER BY t.trial_number`).all(id);
 return { participant, trials };
 } finally { db.close(); }
}
export async function respond(id: string, trialId: string, stage: string, value: {decision: any; confidence: any}) {
 const db = await database();
 try {
 await db.exec("BEGIN");
 await db.prepare("SELECT id FROM participants WHERE id=? FOR UPDATE").get(id);
 const trial = await db.prepare("SELECT * FROM participant_trials WHERE id=? AND participant_id=?").get(trialId,id);
 if (!trial) throw Error("Trial not found");
 const prior = await db.prepare("SELECT count(*) AS n FROM participant_trials WHERE participant_id=? AND trial_number<? AND status!='completed'").get(id,trial.trial_number!);
 if (Number(prior?.n) !== 0) throw Error("Finish the previous question first");
 const now = new Date().toISOString();
 if (stage === "initial") {
 if (trial.status === "pending") {
 if (!isComplete(value)) throw Error("Provide a decision and a confidence rating from 1 to 5");
 await db.prepare("INSERT INTO trial_responses(id,participant_trial_id,initial_decision,initial_confidence,initial_submitted_at,initial_confidence_scale) VALUES(?,?,?,?,?,5)").run(randomUUID(),trialId,value.decision,value.confidence,now);
 await db.prepare("UPDATE participant_trials SET status='ai_reviewed',started_at=COALESCE(started_at,?),ai_reviewed_at=? WHERE id=?").run(now,now,trialId);
 }
 } else if (stage === "final") {
 if (!isComplete(value) || trial.status === "pending") throw Error("Review AI and provide a final confidence rating from 1 to 5 first");
 if (trial.status !== "completed") {
 await db.prepare("UPDATE trial_responses SET final_decision=?,final_confidence=?,final_submitted_at=?,final_confidence_scale=5 WHERE participant_trial_id=?").run(value.decision,value.confidence,now,trialId);
 await db.prepare("UPDATE participant_trials SET status='completed',completed_at=? WHERE id=?").run(now,trialId);
 await db.prepare("UPDATE participant_trials SET started_at=COALESCE(started_at,?) WHERE participant_id=? AND trial_number=?").run(now,id,Number(trial.trial_number)+1);
 await db.prepare("UPDATE participants SET status='completed',completed_at=? WHERE id=? AND 12=(SELECT count(*) FROM participant_trials WHERE participant_id=? AND status='completed' AND is_practice=0)").run(now,id,id);
 }
 } else throw Error("Invalid response stage");
 const ai = await db.prepare(`SELECT s.ai_prediction,s.saliency_path,s.counterfactual_path FROM participant_trials t JOIN stimuli s ON s.id=t.stimulus_id WHERE t.id=?`).get(trialId);
 await db.exec("COMMIT");
 return ai;
 } catch(error) { await db.exec("ROLLBACK"); throw error; } finally { db.close(); }
}
