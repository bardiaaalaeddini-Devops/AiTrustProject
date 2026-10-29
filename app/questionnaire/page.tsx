import { notFound } from "next/navigation";
import { Questionnaire } from "../../components/Questionnaire";

export const dynamic = "force-dynamic";

export default function QuestionnairePage() {
  // Participant collection awaits the informed-consent and backend milestones.
  if (process.env.NODE_ENV !== "development") notFound();
  return <Questionnaire />;
}
