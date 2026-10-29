import { StudyRunner } from "../../components/study/StudyRunner";
import { parseStudyLaunch, type StudyQuery } from "../../lib/prolific";

export const dynamic = "force-dynamic";

interface ConsentPageProps {
  searchParams: Promise<StudyQuery>;
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const launch = parseStudyLaunch(await searchParams, (process.env.NODE_ENV === "development" || process.env.STUDY_ALLOW_DEMO === "true"));

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

  return <StudyRunner launch={launch} />;
}

