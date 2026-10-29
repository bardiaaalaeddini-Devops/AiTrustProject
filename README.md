# AI-Assisted Quality Inspection — Welcome Page Starter

This is a **Next.js App Router + TypeScript** research UI starter. It includes only a production-shaped Welcome page and a clearly labeled placeholder for the next step (informed consent).

## Requirements
- Node.js 20.9+ (Node.js 22 recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`. In development, the page opens in **demo mode** if no Prolific parameters are supplied.

To simulate Prolific, open:
```text
http://localhost:3000/?PROLIFIC_PID=preview123&STUDY_ID=study456&SESSION_ID=session789
```
The "Continue to consent" button forwards the identifiers to `/consent`.

## Tests
```bash
npm test
npm run typecheck
npm run build
```

## Critical research/technical boundaries
- **No responses, participant identifiers, or consent are saved by this starter.** The app only parses the URL and moves to a non-functional consent placeholder.
- A real consent form and a secure backend/database must be implemented before participant recruitment.
- Prolific parameters are input data, **not trusted proof of identity**.
- In production (`npm run build && npm run start`), requests missing any required Prolific parameter show an access message.
- Do not commit secrets, research responses, or the full MVTec dataset to GitHub.
- Test that your Prolific study is configured to pass `PROLIFIC_PID`, `STUDY_ID`, and `SESSION_ID` in the URL.
- We will replace the temporary URL-based handoff with a session-based handoff after the full consent flow is designed.

## Files
- `app/page.tsx`: validates study-entry URL parameters and selects the Welcome state.
- `components/WelcomeCard.tsx`: responsive accessible page content and UI preview.
- `lib/prolific.ts`: Prolific parameter parsing and URL handoff.
- `types/participant.ts`: typed launch objects.
- `app/consent/page.tsx`: **placeholder only**; consent is not collected.
- `app/globals.css`: shared appearance and responsive rules.
- `next.config.ts`: security headers including `Referrer-Policy: no-referrer`.
- `tests/prolific.test.mjs`: parsing/navigation unit tests.

## Next milestone
The development-only `/questionnaire` route provides three sets of twelve illustrative anomaly-inspection samples, decision and confidence controls, per-set answer review, and a JSON download. Open it with `npm run dev`, either directly or from the consent placeholder. Answers remain in React memory and are cleared on refresh. The route returns 404 in production until consent, real stimuli, and response storage are implemented. Illustrations are synthetic interface fixtures, not validated study stimuli; no AI predictions or accuracy scores are provided.

Create the real informed-consent screen, clarify consent text with the research team, and implement safe handling of Prolific identifiers after consent.
