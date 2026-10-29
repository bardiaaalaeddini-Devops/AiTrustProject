import ConsentPage from "../consent/page";
import type { StudyQuery } from "../../lib/prolific";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({ searchParams }: { searchParams: Promise<StudyQuery> }) {
  const query = await searchParams;
  const launch = process.env.NODE_ENV === "development" && Object.keys(query).length === 0
    ? { demo: "1" } : query;
  return <ConsentPage searchParams={Promise.resolve(launch)} />;
}
