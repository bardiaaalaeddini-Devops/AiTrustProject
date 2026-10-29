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


## PostgreSQL storage

The questionnaire now requires PostgreSQL and a server-only DATABASE_URL in .env.local (see .env.example). Local PostgreSQL binaries/data are excluded from Git under .local/. After reboot, run `npm run db:start` in this repository, then `npm run db:migrate` and `npm run dev`. Use `npm run db:stop` for a clean shutdown. Install dependencies with `npm install`.

See [database setup and questionnaire flow](docs/QUESTIONNAIRE_DATABASE.md). Original SQLite data is preserved as a migration source; active writes use PostgreSQL. Never commit .env.local or database files. For a new machine, install PostgreSQL, create a database/application role, set DATABASE_URL, and run migrations. Local .local binaries/data are not included in Git.


## Temporary public preview

Cloudflared is installed locally at `.local/cloudflared.exe`. The running public URL is saved in `.local/public-url`; it expires when the tunnel stops. The production preview server listens on 127.0.0.1:3000. PostgreSQL remains local.

To obtain a new tunnel URL, run `& ".local/cloudflared.exe" tunnel --url http://127.0.0.1:3000 --protocol http2 --no-autoupdate`. Set STUDY_PUBLIC_ORIGIN in .env.local to the exact generated HTTPS origin and restart the application. STUDY_ALLOW_DEMO=true explicitly enables ?demo=1 in a production preview. Set it to false for actual recruitment. Prolific study links use PROLIFIC_PID, STUDY_ID and SESSION_ID, without demo=1. The completion redirect still requires your study's completion URL and a separate integration step.

The current preview server and tunnel run as hidden background processes; logs are under .local/. Keep this computer awake and online throughout testing. Quick Tunnels have no uptime guarantee and can briefly reconnect, producing temporary 5xx errors. They are intended for temporary testing.
