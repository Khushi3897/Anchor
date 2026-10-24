# Anchor: technology stack

## Stack
- **Frontend:** React + Vite + TypeScript. Plain CSS (no UI framework). Tablet-first, responsive down to phone.
- **Persistence:** browser localStorage only (profile, question events, alerts).
- **Voice output:** the browser's built-in speech synthesis. Always provide a replay button and a mute toggle.
- **No backend, no database, no cloud services, no API keys.** Everything runs in the browser so the demo works offline.
- **Answers:** a deterministic answer function built from the caregiver's profile (templates plus a simple keyword intent matcher for free-form text). Unknown questions get "I'm not sure. I'll get [caregiver]." and raise a caregiver alert.
- **Tests:** Vitest for repeat detection, safety-keyword escalation, intent matching, and the answer function.

## Reliability rules
- The patient screen must never show an error. If anything fails, show a calm fallback ("I'm here. I'll get [caregiver].").
- The app must work with no network.

## Secrets and privacy
- No keys exist in this project. Do not add any.
- Never log profile contents or photos to the console in committed code.
- Demo data is fictional.

## Commands
- `npm run dev` starts the app.
- `npm run test` runs Vitest.
- `npm run build` must pass before any commit.

## Scope guard
Keep dependencies minimal. No auth, no database, no routing library beyond what two views need.

## Future (not now)
An optional language-model call could replace the keyword matcher later. Do not build it unless asked.