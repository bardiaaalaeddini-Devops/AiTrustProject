import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedStudyOrigin } from "../lib/requestOrigin.ts";
test("origin checks support one configured tunnel without trusting arbitrary proxies",()=>{
 const local="http://localhost:3000/api/study", publicOrigin="https://preview.trycloudflare.com";
 assert.equal(isAllowedStudyOrigin("http://localhost:3000",local),true);
 assert.equal(isAllowedStudyOrigin(publicOrigin,local,publicOrigin),true);
 for(const origin of [null,"null","https://evil.example","https://preview.trycloudflare.com.evil.example"])
 assert.equal(isAllowedStudyOrigin(origin,local,publicOrigin),false);
 assert.equal(isAllowedStudyOrigin(publicOrigin,local,"invalid"),false);
});
