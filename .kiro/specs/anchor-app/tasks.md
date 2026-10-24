# Implementation Plan: Anchor App

## Overview

Sequential build of the Anchor React + Vite + TypeScript app. Each task targets one file or one
logical unit so tasks can be executed in order without blockers. Safety Checker and Repeat Detector
tests are required; all other test tasks are optional. No routing library, no CSS framework, no
state management beyond React `useState` / `useRef`.

## Tasks

- [ ] 1. Scaffold the project
  - Run `npm create vite@latest . -- --template react-ts` (or equivalent) in the workspace root.
  - Install `fast-check` as a dev dependency for property-based tests.
  - Install `vitest` and `@vitest/coverage-v8` as dev dependencies.
  - Add `"test": "vitest --run"` and `"build"` scripts to `package.json`.
  - Create the directory stubs: `src/lib/`, `src/components/`, `src/data/`, `src/__tests__/`.
  - Delete Vite boilerplate (default `App.css`, `assets/`, placeholder content in `App.tsx`).
  - Verify `npm run build` exits 0 before moving on.
  - _Requirements: 17.1, 17.2_

- [ ] 2. Define shared TypeScript types
  - [ ] 2.1 Create `src/lib/types.ts` with all interfaces and type aliases from the design
    - `Caregiver`, `Person`, `Visitor`, `PhotoCard`, `GentleResponse`, `LifeProfile`
    - `QuestionEvent`, `QuestionIntent` union type
    - `CaregiverAlert`, `AlertSeverity`
    - No runtime logic — types only.
    - _Requirements: 1.1, 2.1, 3.3, 4.1, 5.1, 6.1_

- [ ] 3. Implement the storage module
  - [ ] 3.1 Create `src/lib/storage.ts`
    - Implement `loadProfile`, `saveProfile`, `loadEvents`, `appendEvent`, `loadAlerts`, `appendAlert`.
    - All functions wrap `localStorage` calls in `try/catch`; reads return `null` / `[]` on failure; writes silently fail.
    - Keys: `anchor:profile`, `anchor:events`, `anchor:alerts`.
    - _Requirements: 1.3, 14.1_

- [ ] 4. Implement the Safety Checker
  - [ ] 4.1 Create `src/lib/safetyChecker.ts`
    - Export `checkSafety(input: string): SafetyResult`.
    - Plain `string[]` keyword list (case-insensitive): `hurt`, `pain`, `fell`, `fall`, `bleeding`, `chest`, `can't breathe`, `unsafe`, `leave alone`, `harm`, `kill`, `die`.
    - Case-insensitive match via `input.toLowerCase()`.
    - No network, no model.
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 4.2 Write unit tests for Safety Checker (REQUIRED)
    - Create `src/__tests__/safetyChecker.test.ts`.
    - One test per phrase category: pain expressions, fall reports, self-harm statements, "leave alone" phrases.
    - One negative test (clean input returns `escalation: false`).
    - _Requirements: 18.1, 18.5_

  - [ ] 4.3 Write property test for Safety Checker (REQUIRED)
    - **Property 6: Safety escalation is case-insensitive**
    - For any keyword in the list and any capitalisation variant, `checkSafety(variant)` returns `{ escalation: true }`.
    - Use `fast-check`. Minimum 100 runs. Tag: `// Feature: anchor-app, Property 6: Safety escalation is case-insensitive`.
    - **Validates: Requirements 13.2, 13.4**

- [ ] 5. Implement the Repeat Detector
  - [ ] 5.1 Create `src/lib/repeatDetector.ts`
    - Export `checkRepeat(intent: QuestionIntent, events: QuestionEvent[]): RepeatResult`.
    - Filter events to same intent within last 10 minutes of `Date.now()`.
    - Return `{ isRepeat: true }` when filtered count ≥ 3.
    - _Requirements: 14.2, 14.3_

  - [ ] 5.2 Write unit tests for Repeat Detector (REQUIRED)
    - Create `src/__tests__/repeatDetector.test.ts`.
    - Test: exactly 2 events (no trigger), exactly 3 events (triggers), event older than 10 min excluded.
    - _Requirements: 18.2, 18.6_

  - [ ]* 5.3 Write property tests for Repeat Detector (REQUIRED)
    - **Property 7: Repeat detector excludes stale events**
    - **Property 8: Repeat detector triggers at threshold**
    - Both in `src/__tests__/repeatDetector.test.ts`. Tag each with feature + property number.
    - **Validates: Requirements 14.2, 14.3**

- [ ] 6. Checkpoint — Safety and Repeat Detector tests green
  - Run `npm run test`. All Safety Checker and Repeat Detector tests must pass before proceeding.
  - Fix any failures before moving on.

- [ ] 7. Implement the Intent Matcher
  - [ ] 7.1 Create `src/lib/intentMatcher.ts`
    - Export `matchIntent(input: string): QuestionIntent`.
    - Keyword groups per intent: `who` / `where-am-i` / `what-day` / `where-caregiver` / `unknown`.
    - Case-insensitive. Returns `'unknown'` if no group matches.
    - _Requirements: 19.1, 19.3, 19.4_

  - [ ]* 7.2 Write unit tests for Intent Matcher (optional)
    - Create `src/__tests__/intentMatcher.test.ts`.
    - One test per intent plus one unrecognised input test.
    - _Requirements: 18.3_

  - [ ]* 7.3 Write property test for Intent Matcher (optional)
    - **Property 10: Unknown intent always returns fallback**
    - Tag: `// Feature: anchor-app, Property 10: Unknown intent always returns fallback`.
    - **Validates: Requirements 19.4**

- [ ] 8. Implement the Answer Function
  - [ ] 8.1 Create `src/lib/answerFunction.ts`
    - Export `buildAnswer(intent, profile, isRepeat, repeatComfortPhrase?): AnswerResult`.
    - Handle all five intents: `who`, `where-am-i`, `what-day`, `where-caregiver`, `unknown`.
    - Check `gentleResponses` before intent-specific logic.
    - All output ≤ 2 sentences. Falls back to "I'll get [caregiver name]." when fields are missing.
    - Writes check-in alert via `appendAlert` for `unknown` intent or missing fields.
    - _Requirements: 2.3, 2.4, 2.5, 3.4, 3.5, 3.6, 4.2, 4.5, 6.2, 6.3, 16.1, 16.2, 16.4_

  - [ ]* 8.2 Write unit tests for Answer Function (optional)
    - Create `src/__tests__/answerFunction.test.ts`.
    - Tests: complete profile, partial profile, empty profile.
    - _Requirements: 18.4_

  - [ ]* 8.3 Write property tests for Answer Function (optional)
    - **Property 2: Where-am-I answer contains both profile fields**
    - **Property 3: What-day answer includes date and plan data**
    - **Property 4: Who-is-here answer leads with caregiver name**
    - **Property 5: Gentle response returned verbatim**
    - **Property 9: Answer Function never exceeds two sentences**
    - All in `src/__tests__/answerFunction.test.ts`. Tag each with feature + property number.
    - **Validates: Requirements 2.3, 3.4, 4.2, 6.2, 6.4, 16.4**

- [ ] 9. Implement the Speech wrapper
  - [ ] 9.1 Create `src/lib/speech.ts`
    - Export `speak(text: string, muted: boolean): void`, `cancelSpeech(): void`, `isSpeechSupported(): boolean`.
    - `speak()` calls `cancelSpeech()` first, then calls `window.speechSynthesis.speak()` in a try/catch only when `!muted && isSpeechSupported()`.
    - No network. No external voices.
    - _Requirements: 11.1, 11.4, 11.5, 11.6_

- [ ] 10. Create the Demo Persona data
  - [ ] 10.1 Create `src/data/demoPersona.ts`
    - Export a `LifeProfile` constant with fully fictional data: name, caregivers, location, today's plan, ≥ 2 visitors, ≥ 2 people entries, 5 comfort items, ≥ 3 photo cards (placeholder data URLs), ≥ 1 gentle response.
    - No real names, photos, or personal details.
    - _Requirements: 7.1, 7.2, 7.4_

- [ ] 11. Implement Patient Screen components
  - [ ] 11.1 Create `src/components/LockIcon.tsx`
    - 2-second `pointerdown` hold using `useRef<ReturnType<typeof setTimeout>>`.
    - Calls `onEnterCaregiver` after 2 s; clears timer on `pointerup` / `pointerleave`.
    - Max 32 × 32 CSS px, no text label.
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 11.2 Create `src/components/MuteToggle.tsx`
    - Toggle button, min tap target 80 × 80 CSS px.
    - Accepts `muted: boolean` and `onToggle: () => void`.
    - Default state is unmuted (consumer manages state).
    - _Requirements: 10.4, 11.7_

  - [ ] 11.3 Create `src/components/QuestionButtons.tsx`
    - Four buttons: "Who is here?", "Where am I?", "What day is it?", "Where is [caregiverName]?".
    - Substitutes "your caregiver" when `caregiverName` is absent.
    - Min tap target 80 CSS px tall, 200 CSS px wide. Min font 28 CSS px.
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 11.4 Create `src/components/AskAnchorInput.tsx`
    - Text input (max 200 chars) + "Send" button.
    - Min tap target 80 CSS px tall. Clears field after submission.
    - Calls `onSubmit(text: string)`.
    - _Requirements: 9.6, 19.6, 19.7_

  - [ ] 11.5 Create `src/components/AnswerPanel.tsx`
    - Displays answer text (min 28 CSS px), optional photo (hides on error), Replay button, optional "Look at photos?" button, close control.
    - Accepts `AnswerPanelProps` as defined in the design.
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [ ] 11.6 Create `src/components/PhotoSlideshow.tsx`
    - Full-screen, auto-advances every 7 s via `setInterval` in `useEffect`.
    - CSS cross-fade transition 0.5–1 s. Loops. Close button min 80 CSS px.
    - Shows caption on plain background when image fails to load.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 11.7 Create `src/components/PatientScreen.tsx`
    - Composes `LockIcon`, `MuteToggle`, `QuestionButtons`, `AskAnchorInput`, `AnswerPanel`, `PhotoSlideshow`.
    - Internal state: `answer`, `showSlideshow`, `muted`.
    - No scrollable region. Shows "Look at photos?" only when photo cards exist.
    - _Requirements: 9.5, 10.5, 12.7_

- [ ] 12. Implement Caregiver Setup components
  - [ ] 12.1 Create `src/components/AlertList.tsx`
    - Reads `loadAlerts()`. Urgent alerts at top.
    - Shows "If someone may be in danger, call 911." above first urgent alert.
    - Min 28 CSS px font.
    - _Requirements: 13.5, 15.1, 15.4_

  - [ ] 12.2 Create `src/components/UnmetNeedChecklist.tsx`
    - Eight interactive checkboxes: hungry, thirsty, bathroom, pain, tired, lonely, noisy, too hot/cold.
    - Local UI state only (no persistence needed for MVP).
    - _Requirements: 15.5_

  - [ ] 12.3 Create `src/components/CaregiverDashboard.tsx`
    - Composes `AlertList`, question-count summary (today's counts by intent), time-of-day chart (events grouped by hour 0–23), and `UnmetNeedChecklist`.
    - Reads `loadEvents()` and `loadAlerts()`.
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 12.4 Create `src/components/ProfileEditor.tsx`
    - Sections: Identity, Location, TodayCard, People, ComfortItems, PhotoCards, GentleResponses.
    - Inline validation: required fields flagged before save; max counts enforced (6 photo cards, 20 people, 20 gentle responses, 10 visitors).
    - Photo upload stored as data URL with preview.
    - Demo persona button with confirmation prompt when existing data is present.
    - Demo notice banner while demo persona is active.
    - Reads/writes via `storage.ts`.
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 5.1, 5.2, 5.3, 5.4, 6.1, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 12.5 Create `src/components/CaregiverSetup.tsx`
    - Composes `ProfileEditor` and `CaregiverDashboard` with tab or section navigation.
    - "Back to patient screen" control returns to Patient Screen in one tap.
    - Loads profile on mount; saves on user action.
    - _Requirements: 8.4_

- [ ] 13. Implement App root and error boundary
  - [ ] 13.1 Create the React error boundary in `src/App.tsx` or a separate `src/ErrorBoundary.tsx`
    - Wraps `PatientScreen`. On uncaught error renders "I'm here. I'll get [caregiver name]." (or "I'll get your caregiver." if name unavailable).
    - No stack trace visible to the patient.
    - _Requirements: 9.7_

  - [ ] 13.2 Update `src/App.tsx` to the final structure
    - `useState<'patient' | 'caregiver'>('patient')` — the only navigation mechanism.
    - Renders `PatientScreen` or `CaregiverSetup` based on mode.
    - No routing library.
    - _Requirements: 8.4, 8.5_

- [ ] 14. Author global CSS
  - [ ] 14.1 Write `src/index.css`
    - CSS custom properties: calm palette (soft background, high-contrast text), base font 28 CSS px, tap-target utilities (min 80 px tall, 200 px wide).
    - Tablet-first, responsive to phone.
    - WCAG AA: text contrast ≥ 4.5:1, UI components ≥ 3:1.
    - No flashing. CSS transitions ≥ 200 ms (except PhotoSlideshow cross-fade which uses its own class).
    - No scrollable region on the Patient Screen.
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Wire the Patient question flow end-to-end
  - [ ] 15.1 Wire `safetyChecker → intentMatcher → repeatDetector → answerFunction → speak` inside `PatientScreen.tsx`
    - On button tap or "Ask Anchor" submit: run `checkSafety` first; if escalation, show reply, speak, write urgent alert, stop.
    - Otherwise: `matchIntent` → `checkRepeat` (read events, append new event) → `buildAnswer` → display `AnswerResult` → `speak`.
    - Write check-in alert if `answerResult.alertWritten`.
    - _Requirements: 13.1, 14.1, 14.2, 14.3, 19.1, 19.2_

  - [ ]* 15.2 Write property test for storage round-trip (optional)
    - Create `src/__tests__/storage.test.ts`.
    - **Property 1: Life Profile storage round-trip**
    - Tag: `// Feature: anchor-app, Property 1: Life Profile storage round-trip`.
    - **Validates: Requirements 1.3**

- [ ] 16. Final checkpoint — build and tests green
  - Run `npm run test`. All required tests must pass (Safety Checker unit + property, Repeat Detector unit + property).
  - Run `npm run build`. Build must exit 0 with no TypeScript errors.
  - Fix any failures before considering the implementation complete.
  - _Requirements: 18.7_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Tasks are ordered so each step has all its dependencies available from earlier tasks.
- Safety Checker tests (4.2, 4.3) and Repeat Detector tests (5.2, 5.3) are **required** — do not skip.
- Every other test task (`7.2`, `7.3`, `8.2`, `8.3`, `15.2`) is optional.
- Each task references specific requirements for traceability.
- Checkpoints (tasks 6 and 16) enforce incremental validation.
- Property tests use `fast-check` and must be tagged with `// Feature: anchor-app, Property N: <title>`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.2", "5.3"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 7, "tasks": ["10.1"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4"] },
    { "id": 9, "tasks": ["11.5", "11.6"] },
    { "id": 10, "tasks": ["11.7"] },
    { "id": 11, "tasks": ["12.1", "12.2"] },
    { "id": 12, "tasks": ["12.3", "12.4"] },
    { "id": 13, "tasks": ["12.5"] },
    { "id": 14, "tasks": ["13.1"] },
    { "id": 15, "tasks": ["13.2"] },
    { "id": 16, "tasks": ["14.1"] },
    { "id": 17, "tasks": ["15.1"] },
    { "id": 18, "tasks": ["15.2"] }
  ]
}
```
