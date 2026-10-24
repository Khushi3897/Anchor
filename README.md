# Anchor — Answers within reach

**A calm, caregiver-configured companion for people living with dementia.**
It answers the questions they ask over and over — "Who are you?", "Where am I?", "What day is it?", "Where is Rosie?" — so caregivers do not have to, and it quietly tells the caregiver when repetition may signal worry, pain, or another unmet need.

**Live demo:** https://anchor-dementia.netlify.app
**Runs 100% in the browser** — no server, no database, no API keys, works offline.

---

## The problem

A person with mid-stage dementia can ask the same question dozens of times an hour. Each time, they are genuinely scared or disoriented, and each time the caregiver has to stop, stay patient, and answer again. It is exhausting, and exhaustion leads to burnout.

Anchor gives the person a gentle, consistent, familiar answer every single time, in the caregiver's own words, while giving the caregiver insight and a break.

## Who it is for

- **The patient** uses a single, calm screen. No typing, no menus, no logins, no way to get lost. Large text, big buttons, soft colours, nothing that flashes.
- **The caregiver** sets up a one-time "Life Profile" and gets a private dashboard of what is being asked and when.

---

## What it does

### For the patient
- **Four big questions, one tap each** — Who is here? / Where am I? / What day is it? / Where is [caregiver]? Every answer appears in large text, is read aloud, and shows a photo or a warm themed visual.
- **Ask Anchor** — a free-text box for anything else; a keyword matcher routes it to the right answer from the profile.
- **"I'm feeling worried"** — one tap for instant, profile-grounded reassurance.
- **"Breathe with me"** — a slow, guided breathing circle (4s in / hold / out) to calm anxiety in the moment.
- **Photo slideshow** — tap, swipe, or auto-advance through familiar faces and places for reminiscence.
- **Replay and mute** — every answer can be re-read aloud; speech can be silenced.

### Safety first (runs in plain code, before anything else)
- **Escalation keywords** — phrases like pain, fell, can't breathe, chest, bleeding, scared, want to go home alone, want to die immediately trigger: "I'm getting [caregiver] right now. Stay here with me." and raise an urgent caregiver alert. Never any medical advice.
- **Repeat detection** — the same question 3+ times in 10 minutes leads with comfort ("It's okay to wonder. You're safe."), repeats the exact same fact in the exact same words, offers a calming activity, and flags a check-in alert that it may signal an unmet need.
- **Never invents facts** — every answer is built only from the caregiver's profile. If the profile does not have it: "I'm not sure. I'll get [caregiver]." plus a missing-info alert.

### For the caregiver
- **Life Profile** — preferred name, caregivers, where they live now, today's plan and visitors, important people with photos, comfort items, reminiscence photo cards, and gentle responses (the exact words to use for painful topics like a loved one who has passed).
- **Dashboard** — alerts sorted urgent then check-in then missing-info, each with "Mark handled"; question counts by type; an activity-by-hour chart; and an "Unmet need?" checklist.
- **Load demo persona** — one click seeds a fully fictional profile plus sample events and alerts so the whole app can be explored instantly.

---

## Dementia-safety principles (baked into the code)

1. **Never invent facts** — answers come only from the caregiver's profile.
2. **Never shame repetition** — no "you already asked" or "remember?".
3. **Short and calm** — at most two short sentences, one idea at a time.
4. **Feelings first** — comfort before fact when the person sounds worried.
5. **Do not deceive** — painful topics use the caregiver's exact written words.
6. **No medical advice, ever.**
7. **Accessible** — base font >= 28px, tap targets >= 80px, high contrast, no flashing, no sudden motion.

---

## Tech stack

- **React + Vite + TypeScript**, plain CSS (no UI framework)
- **Browser localStorage** for the profile, question events, and alerts
- **Web Speech API** for read-aloud (device voices only, no network)
- **No backend, no database, no cloud, no API keys** — everything runs client-side, so it works offline
- **Vitest + fast-check** for unit and property-based tests on the safety-critical logic

### Project layout
```
src/
  lib/            pure, testable logic
    safetyChecker.ts     keyword escalation (runs first, always)
    repeatDetector.ts    rolling 10-minute window
    intentMatcher.ts     free text to question intent
    answerFunction.ts    deterministic, profile-only answers
    speech.ts            SpeechSynthesis wrapper
    haptics.ts           gentle tap feedback
    storage.ts           localStorage read/write
  components/     PatientScreen, CaregiverSetup, Dashboard, Slideshow,
                  BreathingExercise, AnswerPanel, and more
  data/           fictional demo persona
```

---

## Run it locally

```bash
npm install
npm run dev   # start the local server at http://localhost:5173
npm run test         # run the Vitest suite
npm run build        # production build to /dist
```

## Try the demo (30 seconds)

1. Hold the small lock icon (bottom-left) for 2 seconds to enter Caregiver Setup.
2. Click Load demo persona, then Back to patient screen.
3. Tap a question to see the spoken, visual answer.
4. Type "I fell" in Ask Anchor to see a safety escalation.
5. Type "I want to go home" to see the caregiver's gentle response.
6. Tap Breathe with me for the calming exercise.

---

## Privacy

No accounts, no tracking, no network calls. All data stays in the browser's local storage on the device. The demo persona is entirely fictional — no real names, faces, or details.

## Built with Kiro

Spec-driven: requirements, then design, then tasks, then implementation, with the dementia-safety rules enforced as steering throughout.
