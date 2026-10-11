import type { ProlificIdentifiers, StudyLaunch } from "../types/participant";

/**
 * Next.js parses query parameters as strings or string arrays.
 * Array values are rejected rather than silently choosing an arbitrary ID.
 */
export type StudyQuery = Record<string, string | string[] | undefined>;

/**
 * Keep identifiers within a conservative format and length.
 * This is input validation, NOT authentication or identity verification.
 */
function readIdentifier(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;

  return trimmed;
}

/**
 * Parse Prolific's configured URL parameters when the participant arrives.
 * Do not persist them in a database or browser storage before consent.
 * In local development, opening the root URL without IDs starts demo mode.
 */
export function parseStudyLaunch(query: StudyQuery, allowDemo = false): StudyLaunch | null {
  const prolificPid = readIdentifier(query.PROLIFIC_PID);
  const studyId = readIdentifier(query.STUDY_ID);
  const sessionId = readIdentifier(query.SESSION_ID);

  if (prolificPid && studyId && sessionId) {
    const identifiers: ProlificIdentifiers = { prolificPid, studyId, sessionId };
    return { kind: "prolific", identifiers };
  }

  // Demo mode is permitted only when explicitly enabled by the server.
  // Partial or malformed Prolific parameter sets must never become demo runs.
  const hasAnyProlificParam = ["PROLIFIC_PID", "STUDY_ID", "SESSION_ID"].some(
    (key) => query[key] !== undefined
  );
  if (allowDemo && !hasAnyProlificParam && (query.demo === undefined || query.demo === "1")) {
    return { kind: "demo", identifiers: null };
  }

  return null;
}

/**
 * Preserve URL identifiers until the consent step without server-side storage.
 * This is a temporary prototype handoff; later we will exchange them for a
 * short-lived server session after consent and avoid exposing them in URLs.
 */
export function buildConsentHref(launch: StudyLaunch): string {
  const query = new URLSearchParams();

  if (launch.kind === "prolific") {
    query.set("PROLIFIC_PID", launch.identifiers.prolificPid);
    query.set("STUDY_ID", launch.identifiers.studyId);
    query.set("SESSION_ID", launch.identifiers.sessionId);
  } else {
    query.set("demo", "1");
  }

  return `/consent?${query.toString()}`;
}
