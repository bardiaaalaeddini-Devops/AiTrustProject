// Draft content is centralized so ethics-approved text can replace it later.
export const consentParagraphs = [
  "Development consent draft — not approved for participant recruitment.",
  "You will inspect demonstration images, make decisions, and review simulated AI assistance. Participation is voluntary. You may stop at any time by closing this page.",
  "Your decisions and confidence ratings are saved on the study server with your study identifiers. Refreshing the page allows you to resume your recorded progress.",
  "Final study duration, risks, compensation, withdrawal policy, data retention, and researcher and ethics contact details must be supplied in the approved participant information before recruitment."
];
export const comprehensionQuestions = [
  { id: "decision", prompt: "Who makes the final decision?", options: ["You, the quality inspector.", "The AI system."], correct: "You, the quality inspector." },
  { id: "fallibility", prompt: "Can the AI system make incorrect predictions?", options: ["Yes.", "No."], correct: "Yes." }
];
