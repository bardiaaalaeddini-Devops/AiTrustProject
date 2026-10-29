import { config } from "dotenv";
import { Client } from "pg";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
config({path:".env.local",quiet:true});
if(!process.argv[2] || !process.env.DATABASE_URL)throw Error("Usage: node scripts/import-sqlite.mjs <source.sqlite>; DATABASE_URL required");
const source=new DatabaseSync(process.argv[2],{readOnly:true});
const client=new Client({connectionString:process.env.DATABASE_URL});
await client.connect();
const tables=["participants","stimuli","participant_trials","trial_responses","questionnaire_items","questionnaire_answers"];
function normalized(value,key){if(value!==null && key.endsWith("_at"))return new Date(typeof value==="string" && !value.includes("T")?value.replace(" ","T")+"Z":value).toISOString();return value;}
try {
 await client.query("BEGIN");
 for(const table of tables){
 const rows=source.prepare(`SELECT * FROM ${table}`).all();
 for(const row of rows){
 const columns=Object.keys(row).filter(key=>key!=="decision_switched");
 const values=columns.map(key=>normalized(row[key],key));
 await client.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map((_,i)=>`$${i+1}`).join(",")}) ON CONFLICT (id) DO NOTHING`,values);
 const saved=(await client.query(`SELECT * FROM ${table} WHERE id=$1`,[row.id])).rows[0];
 for(const key of Object.keys(row))assert.deepEqual(normalized(saved[key],key),normalized(row[key],key),`${table}.${key} mismatch`);
 }
 console.log(`${table}: ${rows.length} records verified`);
 }
 await client.query("COMMIT");console.log("Import committed; SQLite source was opened read-only and preserved.");
} catch(e){await client.query("ROLLBACK");throw e;}finally{source.close();await client.end();}
