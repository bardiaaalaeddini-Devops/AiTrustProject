import test from "node:test";
import assert from "node:assert/strict";
import { parseStudyLaunch, buildConsentHref } from "../lib/prolific.ts";

// These tests validate URL parsing, safe demo fallback, and navigation.
test("accepts complete Prolific parameters", () => {
  const launch = parseStudyLaunch({
    PROLIFIC_PID: "abc123",
    STUDY_ID: "study456",
    SESSION_ID: "session789"
  });
  assert.equal(launch?.kind, "prolific");
  assert.equal(launch?.identifiers.prolificPid, "abc123");
  assert.equal(buildConsentHref(launch), "/consent?PROLIFIC_PID=abc123&STUDY_ID=study456&SESSION_ID=session789");
});

test("blocks an incomplete parameter set even when demo is enabled", () => {
  assert.equal(parseStudyLaunch({ PROLIFIC_PID: "abc123" }, true), null);
});

test("rejects duplicate or malformed identifiers", () => {
  assert.equal(parseStudyLaunch({ PROLIFIC_PID: ["a", "b"], STUDY_ID: "test", SESSION_ID: "test" }), null);
  assert.equal(parseStudyLaunch({ PROLIFIC_PID: "<script>", STUDY_ID: "test", SESSION_ID: "test" }), null);
});

test("demo mode works only when the server explicitly allows it", () => {
  assert.equal(parseStudyLaunch({}), null);
  const launch = parseStudyLaunch({}, true);
  assert.equal(launch?.kind, "demo");
  assert.equal(buildConsentHref(launch), "/consent?demo=1");
});

test("blocks malformed demo parameters", () => {
  assert.equal(parseStudyLaunch({ demo: "unexpected" }, true), null);
});
