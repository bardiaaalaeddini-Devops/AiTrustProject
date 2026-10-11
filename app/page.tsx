import { WelcomeCard } from "../components/WelcomeCard";
import { parseStudyLaunch, buildConsentHref, type StudyQuery } from "../lib/prolific";

/**
 * The URL is participant-specific. Render it on demand and never cache
 * a participant's launch parameters as a reusable static page.
 */
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<StudyQuery>;
}

/**
 * Welcome page entry point.
 * 1. Read the incoming Prolific URL parameters.
 * 2. Allow missing identifiers only in local development.
 * 3. Display the study introduction without collecting responses.
 * 4. Link the participant to the pending consent step.
 */
export default async function HomePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const launch = parseStudyLaunch(query, process.env.NODE_ENV === "development");

  if (!launch) {
    return (
      <main className="access-wrapper">
        <section className="access-card" aria-labelledby="access-title">
          <div className="access-icon" aria-hidden="true">!</div>
          <h1 id="access-title">Please open this study through Prolific</h1>
          <p>
            This study requires a valid participant link. Return to Prolific and
            open the study from your submission page.
          </p>
          <p className="access-help">
            If you are a researcher testing the page locally, run the development
            server and open its root URL.
          </p>
        </section>
      </main>
    );
  }

  return <WelcomeCard consentHref={buildConsentHref(launch)} isDemo={launch.kind === "demo"} />;
}
