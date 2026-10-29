import { config } from "dotenv";
import { Client } from "pg";
import { readFileSync } from "node:fs";
config({path:".env.local",quiet:true});
if(!process.env.DATABASE_URL)throw Error("DATABASE_URL missing");
const client=new Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {await client.query("BEGIN");await client.query(await readFileSync(new URL("../database/schema.sql",import.meta.url),"utf8"));await client.query("COMMIT");console.log("PostgreSQL schema ready.");}
catch(e){await client.query("ROLLBACK");throw e;}finally{await client.end();}
