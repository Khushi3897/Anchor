# Anchor — Answers within reach

**A calm, caregiver-configured companion for people living with dementia.**
It answers the questions they ask over and over — "Who are you?", "Where am I?", "What day is it?", "Where is Rosie?" — so caregivers do not have to, and it quietly tells the caregiver when repetition may signal worry, pain, or another unmet need.

**Live demo:** https://anchor-dementia.netlify.app
**Runs 100% in the browser** — no server, no database, no API keys, works offline.
**Built with Kiro** using spec-driven development and safety steering files (see the `.kiro/` directory).

---

## 1. Project overview

### The problem
A person with mid-stage dementia can ask the same question dozens of times an hour. Each time they are genuinely scared or disoriented, and each time the caregiver has to stop, stay patient, and answer again. That relentless repetition is one of the leading causes of caregiver burnout — and burnout leads to worse care for the person who needs it most.

### Target users
- **The patient** — an adult with mild-to-moderate dementia. They use one calm screen: no typing, no menus, no logins, no way to get lost. Large text, big buttons, soft colours, nothing that flashes.
- **The caregiver** — a family member or aide, often exhausted. They do a one-time "Life Profile" setup (under 10 minutes) and get a private dashboard.

### Key features
- **Four big one-tap questions** — Who is here? / Where am I? / What day is it? / Where is [caregiver]? Each answer is large text, read aloud, and shown with a photo or a warm themed visual.
- **Ask Anchor** — a free-text box; a keyword matcher routes it to the right profile answer.
- **Safety escalation** — danger phrases (pain, fell, can't breathe, chest, bleeding, scared, want to go home alone, want to die) trigger an immediate "I'm getting [caregiver] right now. Stay here with me." and an urgent alert. Runs in plain code before anything else. Never gives medical advice.
- **Repeat detection** — the same question 3+ times in 10 minutes leads with comfort, repeats the exact same fact in the exact same words, offers a calming activity, and raises a check-in alert.
- **Gentle responses** — for painful topics (a loved one who has passed, wanting to "go home"), Anchor speaks the caregiver's exact pre-written words, never an invented comfort.
- **"I'm feeling worried"** and **"Breathe with me"** — one-tap reassurance and a slow guided breathing exercise.
- **Photo slideshow** — tap, swipe, or auto-advance through familiar faces for reminiscence.
- **Caregiver dashboard** — alerts (urgent, check-in, missing-info) with "Mark handled", question counts by type, an activity-by-hour chart, and an "Unmet need?" checklist.

---

## 2. Design decisions and trade-offs

**No backend, no database, no cloud, no API keys.**
Health-adjacent data about a vulnerable person should not sit on someone else's server during a hackathon build. Keeping everything in the browser's `localStorage` means zero data ever leaves the device, the app works with no internet, and there is nothing to breach, bill, or maintain. Trade-off: data lives on one device and is not synced across devices — acceptable for a single-household MVP, and a clear future scaling point.

**Deterministic answers instead of an LLM.**
The single most important safety property is that Anchor never says something false to a confused, trusting person. A language model can hallucinate; a template function driven only by the caregiver's profile cannot. Every answer is built from profile fields or returns "I'm not sure. I'll get [caregiver]." Trade-off: less conversational flexibility, bought in exchange for a guarantee that it can never invent a fact. This was a deliberate, safety-first choice.

**Safety and repeat checks run in plain code, before any answer logic.**
The safety keyword check is the first thing that runs on any free-text input, so an escalation can never be delayed or swallowed by later logic. It needs no model and no network, so it works even if everything else fails.

**Accessibility as a hard constraint, not a polish step.**
Base font >= 28px, tap targets >= 80px, high contrast, no flashing, no sudden motion — enforced in CSS tokens and encoded in the steering file so every component inherited them.

**System fonts, bundled assets.**
To honour the offline requirement, the app ships no external font or CDN request; it uses a rounded system-font stack so it renders instantly with no network.

---

## 3. How I used Kiro

This project was built with Kiro's **spec-driven workflow**, and the full `.kiro/` directory is committed at the repo root.

### Steering files (`.kiro/steering/`)
Three always-on steering documents shaped every decision Kiro and I made:
- **`dementia-safety.md`** — the heart of the project. It encodes the non-negotiable tone and safety rules: never invent facts, never shame repetition, at most two short sentences, comfort before fact, use the caregiver's exact words for painful topics, no medical advice, and the exact escalation behaviour. Because this was steering (not a one-off prompt), those rules were applied consistently across the answer function, the safety checker, the repeat detector, and all the UI copy.
- **`product.md`** — product overview, users, MVP scope, and non-goals, which kept the build focused and prevented scope creep.
- **`tech.md`** — the stack and hard constraints (browser-only, localStorage, Web Speech API, no keys, Vitest), which kept every technical choice inside the rules.

### Spec-driven development (`.kiro/specs/anchor-app/`)
Rather than jumping straight to code, the feature was built as a spec:
- **`requirements.md`** — 19 requirements written in EARS-style acceptance criteria (e.g. exact escalation phrasing, the 3-in-10-minutes repeat window, the "never invent facts" rule), each one testable.
- **`design.md`** — a short architecture doc: single-page app with `patient | caregiver` state, pure logic modules in `src/lib`, the data model, and 10 correctness properties mapped back to requirements.
- **`tasks.md`** — the requirements and design decomposed into sequential, dependency-ordered implementation tasks, with the safety-critical tests marked required and others optional.

The specs were refined requirement-by-requirement before any implementation, so by the time code was written the hard questions (what exactly escalates? what is the repeat window? what happens when data is missing?) were already answered.

### Testing driven by the spec
The design's correctness properties became **Vitest + fast-check** tests. The safety checker and repeat detector — the two pieces where a bug could actually harm someone — have both example tests and property-based tests (e.g. "any capitalisation of any escalation keyword must escalate", "3+ identical intents in 10 minutes must flag"). 32 tests pass and the build gates on them.

---

## 4. Learning journey

**Challenges overcome**
- **Ordering safety correctly.** Early on, the safety check was tangled with intent matching. Separating it into a plain-code pass that runs first, on raw text, before any other logic, was the key insight — it guarantees an escalation can never be missed.
- **Repeat detection windows.** Getting the rolling 10-minute window right (exactly 2 does not fire, exactly 3 does, stale events drop out) was subtle; property-based tests caught the boundary bugs.
- **Deploying a private-by-default host.** The live site initially returned a 401 login wall because the host defaulted to private; flipping it public fixed it. A good reminder to always test a share link from outside your own session.

**Skills gained**
- Writing testable, EARS-style requirements and letting them drive design and tests.
- Using steering files to make a cross-cutting concern (safety and tone) consistent across an entire codebase.
- Property-based testing for safety-critical logic.

**Future scaling ideas**
- Optional encrypted sync so a profile can move across a household's devices.
- Caregiver-recorded voice for answers (a familiar voice is deeply calming in dementia care).
- An optional, carefully-sandboxed language model for the free-text matcher only — never for generating facts, always falling back to the deterministic function.
- Multi-language support for the patient screen.

---

## 5. Tech stack and project layout

- **React + Vite + TypeScript**, plain CSS (no UI framework)
- **Browser localStorage** for the profile, question events, and alerts
- **Web Speech API** for read-aloud (device voices only, no network)
- **Vitest + fast-check** for unit and property-based tests
- **No backend, no database, no cloud, no API keys**

```
.kiro/
  steering/        dementia-safety.md, product.md, tech.md   (always-on rules)
  specs/anchor-app/ requirements.md, design.md, tasks.md     (spec-driven build)
src/
  lib/             pure, testable logic
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

## 6. Run it locally

```bash
npm install
npm run dev   # local server at http://localhost:5173
npm run test         # run the Vitest suite (32 tests)
npm run build        # production build to /dist
```

## 7. Try the demo (30 seconds)

1. Hold the small lock icon (bottom-left) for 2 seconds to enter Caregiver Setup.
2. Click Load demo persona, then Back to patient screen.
3. Tap a question to see the spoken, visual answer.
4. Type "I fell" in Ask Anchor to see a safety escalation.
5. Type "I want to go home" to see the caregiver's gentle response.
6. Tap Breathe with me for the calming exercise.

---

## Privacy

No accounts, no tracking, no network calls. All data stays in the browser's local storage on the device. The demo persona is entirely fictional — no real names, faces, or details.
