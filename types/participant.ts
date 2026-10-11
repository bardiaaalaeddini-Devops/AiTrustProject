/**
 * Identifiers provided by Prolific via configured study URL parameters.
 * They are identifiers, not proof of identity or permission to complete.
 */
export interface ProlificIdentifiers {
  prolificPid: string;
  studyId: string;
  sessionId: string;
}

/**
 * Demo mode is for local development only; it has no real Prolific IDs.
 * Production mode requires all three URL parameters.
 */
export type StudyLaunch =
  | { kind: "prolific"; identifiers: ProlificIdentifiers }
  | { kind: "demo"; identifiers: null };
