import Link from "next/link";
import { parseStudyLaunch, type StudyQuery } from "../../lib/prolific";

/**
 * This intentionally incomplete route keeps the Welcome navigation testable.
 * The actual informed-consent content and acceptance handling are the next
 * implementation milestone. This placeholder NEVER records consent.
 */
export const dynamic = "force-dynamic";

interface ConsentPageProps {
  searchParams: Promise<StudyQuery>;
}

export default async function ConsentPlaceholder({ searchParams }: ConsentPageProps) {
  const launch = parseStudyLaunch(await searchParams, process.env.NODE_ENV === "development");

  if (!launch) {
    return (
      <main className="access-wrapper">
        <section className="access-card">
          <h1>Study link unavailable</h1>
          <p>Open this study through your Prolific invitation.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="access-wrapper">
      <section className="access-card consent-placeholder">
        <span className="small-tag">STEP 2 — UNDER CONSTRUCTION</span>
        <h1>Informed consent</h1>
        <p>
          This is the next screen to implement. The final consent text and
          acceptance controls have not been added yet.
        </p>
        <p className="access-help">
          No consent has been recorded. No participant answers have been collected.
        </p>
        <Link className="text-link" href="/">Back to welcome (local preview)</Link>
        {process.env.NODE_ENV === "development" && <p><Link className="text-link" href="/questionnaire">Open questionnaire development preview →</Link></p>}
      </section>
    </main>
  );
}
