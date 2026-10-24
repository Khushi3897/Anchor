# Design Document

## Overview

Anchor is a single-page React + Vite + TypeScript application that runs entirely in the browser. It has two view states — **patient** and **caregiver** — managed by a single React state variable. There is no routing library; a `useState<'patient' | 'caregiver'>` at the `App` root is the only navigation mechanism.

All persistence is `localStorage`. All answers come from a deterministic `answerFunction` that reads the Life Profile from storage. Safety escalation and repeat detection are pure TypeScript functions that run before any answer logic. Speech uses the browser's built-in `SpeechSynthesis` API wrapped in a thin module.

The goal is a working hackathon demo: flat folder structure, no over-engineering, fast to ship.

---

## Architecture

```
Browser (localStorage)
       │
       ▼
  App (React root)
  ├── mode: 'patient' | 'caregiver'
  ├── PatientScreen          (when mode === 'patient')
  │   ├── QuestionButtons
  │   ├── AskAnchorInput
  │   ├── AnswerPanel
  │   │   └── ReplayButton
  │   ├── PhotoSlideshow
  │   ├── MuteToggle
  │   └── LockIcon (2-second hold → caregiver mode)
  └── CaregiverSetup         (when mode === 'caregiver')
      ├── ProfileEditor
      │   ├── IdentitySection
      │   ├── LocationSection
      │   ├── TodayCardSection
      │   ├── PeopleSection
      │   ├── ComfortItemsSection
      │   ├── PhotoCardsSection
      │   └── GentleResponsesSection
      └── CaregiverDashboard
          ├── AlertList
          ├── QuestionCountSummary
          ├── TimeOfDayChart
          └── UnmetNeedChecklist
```

**Data flow for every Patient question:**

```
User input
    → safetyChecker()        (plain-code, runs first, always)
    → if escalation: show reply + write urgent alert → STOP
    → intentMatcher()
    → repeatDetector()       (reads/writes event log in localStorage)
    → answerFunction()       (reads Life Profile from localStorage)
    → display answer + speak it
    → write CaregiverAlert if needed
```

---

## Components and Interfaces

### App

```tsx
// src/App.tsx
type AppMode = 'patient' | 'caregiver';

function App() {
  const [mode, setMode] = useState<AppMode>('patient');
  return mode === 'patient'
    ? <PatientScreen onEnterCaregiver={() => setMode('caregiver')} />
    : <CaregiverSetup onBack={() => setMode('patient')} />;
}
```

### PatientScreen

```tsx
// src/components/PatientScreen.tsx
interface PatientScreenProps {
  onEnterCaregiver: () => void;
}
```

Internal state:
- `answer: string | null` — current displayed answer
- `showSlideshow: boolean`
- `muted: boolean` (default `false`)

### LockIcon (inside PatientScreen)

Uses `pointerdown` / `pointerup` / `pointerleave` events to implement the 2-second hold:

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handlePointerDown = () => {
  timerRef.current = setTimeout(() => {
    onEnterCaregiver();
  }, 2000);
};

const handlePointerUp = () => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

// Attach handlePointerUp to both pointerup and pointerleave
```

### AnswerPanel

```tsx
interface AnswerPanelProps {
  answer: string;
  photo?: string; // data URL
  muted: boolean;
  onReplay: () => void;
  onLookAtPhotos?: () => void; // only shown when photo cards exist
  onClose: () => void;
}
```

### PhotoSlideshow

```tsx
interface PhotoSlideshowProps {
  cards: PhotoCard[];
  onClose: () => void;
}
```

Auto-advances every 7 seconds (within the 5–10 s requirement). Uses `setInterval` in a `useEffect`. Cross-fade via a CSS class swap.

### CaregiverSetup

```tsx
interface CaregiverSetupProps {
  onBack: () => void;
}
```

Loads the current `LifeProfile` from `storage.loadProfile()` on mount. Saves via `storage.saveProfile()`.

### AlertList

Reads `storage.loadAlerts()`. Renders urgent alerts at top with the "If someone may be in danger, call 911." banner.

---

## Data Models

### LifeProfile

```ts
// src/lib/types.ts

export interface Caregiver {
  name: string;           // 1–50 chars
  relationship: string;   // 1–30 chars
  phone: string;
  photoUrl?: string;      // data URL
}

export interface Person {
  name: string;           // 1–50 chars
  relationship: string;   // 1–30 chars
  photoUrl?: string;      // data URL
  warmSentence: string;   // 1–100 chars
}

export interface Visitor {
  name: string;           // up to 50 chars
  arrivalTime?: string;   // up to 20 chars, e.g. "2:00 pm"
}

export interface PhotoCard {
  imageUrl: string;       // data URL
  caption: string;        // up to 80 chars
}

export interface GentleResponse {
  triggerTopic: string;   // 1–60 chars
  replyText: string;      // 1–300 chars
}

export interface LifeProfile {
  patientName: string;                  // 1–50 chars
  primaryCaregiver: Caregiver;
  additionalCaregivers: Caregiver[];    // optional extras
  locationText: string;                 // up to 150 chars
  reassuranceText: string;              // up to 150 chars
  todayPlan: string;                    // up to 280 chars
  visitors: Visitor[];                  // up to 10
  people: Person[];                     // up to 20
  comfortItems: string[];               // exactly 5 slots, each up to 60 chars
  photoCards: PhotoCard[];              // up to 6
  gentleResponses: GentleResponse[];    // up to 20
  isDemoPersona: boolean;
}
```

### QuestionEvent

```ts
export interface QuestionEvent {
  intent: QuestionIntent;   // 'who' | 'where-am-i' | 'what-day' | 'where-caregiver' | 'unknown'
  timestamp: string;        // ISO 8601
  rawInput: string;
}

export type QuestionIntent =
  | 'who'
  | 'where-am-i'
  | 'what-day'
  | 'where-caregiver'
  | 'unknown';
```

### CaregiverAlert

```ts
export type AlertSeverity = 'urgent' | 'check-in';

export interface CaregiverAlert {
  id: string;               // crypto.randomUUID()
  severity: AlertSeverity;
  message: string;
  timestamp: string;        // ISO 8601 / UTC
  triggerPhrase?: string;   // for safety escalations
  intent?: QuestionIntent;  // for repeat detection / unanswered intents
  repeatCount?: number;     // for repeat detection alerts
  windowStart?: string;     // ISO 8601, for repeat detection
}
```

### localStorage Key Schema

| Key | Type | Description |
|-----|------|-------------|
| `anchor:profile` | `LifeProfile` (JSON) | The full Life Profile |
| `anchor:events` | `QuestionEvent[]` (JSON) | All question events, unbounded log |
| `anchor:alerts` | `CaregiverAlert[]` (JSON) | All caregiver alerts, newest first |

---

## src/lib Modules and Function Signatures

### storage.ts

```ts
// src/lib/storage.ts
export function loadProfile(): LifeProfile | null;
export function saveProfile(profile: LifeProfile): void;

export function loadEvents(): QuestionEvent[];
export function appendEvent(event: QuestionEvent): void;

export function loadAlerts(): CaregiverAlert[];
export function appendAlert(alert: CaregiverAlert): void;
```

All functions JSON-parse/stringify synchronously. No error is surfaced to the Patient Screen — failures return `null` / `[]`.

### safetyChecker.ts

```ts
// src/lib/safetyChecker.ts
export interface SafetyResult {
  escalation: boolean;
  triggerPhrase?: string;
}

export function checkSafety(input: string): SafetyResult;
```

Keyword list is a plain `string[]` constant (case-insensitive match via `input.toLowerCase()`). Examples: `['hurt', 'pain', 'fell', 'fall', 'bleeding', 'chest', 'can't breathe', 'unsafe', 'leave alone', 'harm', 'kill', 'die']`. Runs before everything else. No network. No model.

### intentMatcher.ts

```ts
// src/lib/intentMatcher.ts
export function matchIntent(input: string): QuestionIntent;
```

Keyword groups per intent:
- `who` — "who", "here", "with me", "around", "visiting"
- `where-am-i` — "where am i", "where are we", "where is this", "what place", "am i"
- `what-day` — "what day", "what time", "today", "date", "when"
- `where-caregiver` — "where is", caregiver name (read from profile), "caregiver", "mum", "mom", "dad"

Returns `'unknown'` if no group matches. Case-insensitive.

### answerFunction.ts

```ts
// src/lib/answerFunction.ts
export interface AnswerResult {
  text: string;
  photoUrl?: string;       // relevant photo data URL, if any
  alertWritten: boolean;   // true if a check-in alert was appended
}

export function buildAnswer(
  intent: QuestionIntent,
  profile: LifeProfile,
  isRepeat: boolean,
  repeatComfortPhrase?: string
): AnswerResult;
```

Rules (from requirements):
- `who`: caregiver name first, then up to 2 People entries. Falls back to "I'll get [caregiver name]."
- `where-am-i`: location + reassurance. Falls back per Req 2.4 / 2.5.
- `what-day`: current date + plan + visitors from device clock. Falls back per Req 3.5 / 3.6.
- `where-caregiver`: caregiver name + relationship sentence from profile.
- `unknown`: "I'll get [caregiver name]." + write check-in alert.
- Gentle responses checked before intent answers when intent maps to a painful topic.
- All output ≤ 2 sentences.

### repeatDetector.ts

```ts
// src/lib/repeatDetector.ts
export interface RepeatResult {
  isRepeat: boolean;    // true when count >= 3 in 10-minute window
  count: number;
  windowStart: string;  // ISO 8601 of earliest event in window
}

export function checkRepeat(
  intent: QuestionIntent,
  events: QuestionEvent[]
): RepeatResult;
```

Filters `events` to those with the same `intent` whose `timestamp` is within the last 10 minutes of `now`. Returns `isRepeat: true` when filtered count ≥ 3.

### speech.ts

```ts
// src/lib/speech.ts
export function speak(text: string, muted: boolean): void;
export function cancelSpeech(): void;
export function isSpeechSupported(): boolean;
```

`speak()` calls `cancelSpeech()` first (stops any in-progress utterance), then — if `!muted && isSpeechSupported()` — creates a new `SpeechSynthesisUtterance` and calls `window.speechSynthesis.speak()`. No network. No external voices.

---

## File / Folder Structure

```
src/
├── App.tsx                    # root; manages 'patient' | 'caregiver' state
├── main.tsx                   # ReactDOM.createRoot
├── index.css                  # global reset, CSS custom properties (palette, font sizes)
├── lib/
│   ├── types.ts               # all shared TypeScript types
│   ├── storage.ts             # localStorage read/write
│   ├── safetyChecker.ts       # keyword escalation
│   ├── intentMatcher.ts       # maps free text → QuestionIntent
│   ├── answerFunction.ts      # profile → answer string
│   ├── repeatDetector.ts      # rolling-window repeat check
│   └── speech.ts              # SpeechSynthesis wrapper
├── components/
│   ├── PatientScreen.tsx
│   ├── LockIcon.tsx           # 2-second hold logic
│   ├── QuestionButtons.tsx
│   ├── AskAnchorInput.tsx
│   ├── AnswerPanel.tsx
│   ├── PhotoSlideshow.tsx
│   ├── MuteToggle.tsx
│   ├── CaregiverSetup.tsx
│   ├── ProfileEditor.tsx
│   ├── CaregiverDashboard.tsx
│   ├── AlertList.tsx
│   └── UnmetNeedChecklist.tsx
├── data/
│   └── demoPersona.ts         # fictional demo data, no real names/photos
└── __tests__/
    ├── safetyChecker.test.ts
    ├── repeatDetector.test.ts
    ├── intentMatcher.test.ts
    └── answerFunction.test.ts
```

No routing library. No CSS framework. No state management library beyond React `useState` / `useRef`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Life Profile storage round-trip

*For any* valid `LifeProfile` object, calling `saveProfile(profile)` followed immediately by `loadProfile()` SHALL return an object that is deeply equal to the original profile.

**Validates: Requirements 1.3**

### Property 2: Where-am-I answer contains both profile fields

*For any* `LifeProfile` where both `locationText` and `reassuranceText` are non-empty strings, calling `buildAnswer('where-am-i', profile, false)` SHALL return a text that contains `locationText` and `reassuranceText` as substrings.

**Validates: Requirements 2.3**

### Property 3: What-day answer includes date and plan data

*For any* `LifeProfile` with a non-empty `todayPlan` and at least one `Visitor`, calling `buildAnswer('what-day', profile, false)` SHALL return text that includes the current weekday, the plan text, and each visitor's name.

**Validates: Requirements 3.4**

### Property 4: Who-is-here answer leads with caregiver name

*For any* `LifeProfile` whose `primaryCaregiver.name` is non-empty, calling `buildAnswer('who', profile, false)` SHALL return text that includes `primaryCaregiver.name`.

**Validates: Requirements 4.2**

### Property 5: Gentle response is returned verbatim

*For any* `GentleResponse` entry with non-empty `triggerTopic` and `replyText`, when the `Intent Matcher` maps a Patient input to that entry's topic and `buildAnswer` is called, the returned text SHALL be exactly equal to `replyText` with no modification to wording, punctuation, or capitalisation.

**Validates: Requirements 6.2, 6.4**

### Property 6: Safety escalation is case-insensitive

*For any* escalation keyword `K` in the safety keyword list and *for any* capitalisation variant of `K` (e.g. uppercase, lowercase, mixed), `checkSafety(variant)` SHALL return `{ escalation: true }`.

**Validates: Requirements 13.2, 13.4**

### Property 7: Repeat detector excludes stale events

*For any* array of `QuestionEvent` objects, `checkRepeat(intent, events)` SHALL exclude from its count every event whose `timestamp` is more than 10 minutes before the current time, regardless of intent or total event count.

**Validates: Requirements 14.2**

### Property 8: Repeat detector triggers at threshold

*For any* `QuestionIntent` and *for any* sequence of 3 or more `QuestionEvent` objects sharing that intent whose timestamps all fall within the last 10 minutes, `checkRepeat(intent, events)` SHALL return `{ isRepeat: true }`.

**Validates: Requirements 14.3**

### Property 9: Answer Function never exceeds two sentences

*For any* valid `LifeProfile` and *for any* `QuestionIntent`, `buildAnswer(intent, profile, false)` SHALL return a string containing at most two sentence-ending punctuation characters (`.`, `?`, or `!`).

**Validates: Requirements 16.4**

### Property 10: Unknown intent always returns fallback

*For any* input string that contains no keyword matching any of the four defined intents, `matchIntent(input)` SHALL return `'unknown'`, and the subsequent `buildAnswer` call SHALL return a string beginning with "I'll get".

**Validates: Requirements 19.4**

---

## Error Handling

- **Patient Screen errors:** A React error boundary wraps `PatientScreen`. On any uncaught error it renders "I'm here. I'll get [caregiver name]." (or "I'll get your caregiver." if no name is available). No stack trace is ever shown to the Patient.
- **localStorage failures:** `storage.ts` wraps all calls in `try/catch`. Reads return `null` / `[]` on failure. Writes silently fail. The Patient Screen continues operating in-memory.
- **SpeechSynthesis failures:** `speak()` wraps `window.speechSynthesis.speak()` in a try/catch. If the API is absent or throws, the answer text is still displayed visually — no speech error is surfaced (Req 11.6, 13.6).
- **Missing profile fields:** `answerFunction.ts` checks each field before using it and falls through to the "I'll get [caregiver]." fallback. It never throws.
- **Photo load failures:** All `<img>` tags use `onError` to hide themselves; no broken-image icon is shown (Req 4.4, 10.2, 12.6).

---

## Testing Strategy

This feature involves pure logic functions with well-defined inputs and outputs, making it suitable for both property-based and example-based testing.

**Unit tests** (Vitest, satisfying Req 18):
- `safetyChecker.test.ts` — one test per phrase category (pain, fall, self-harm, leave-alone), plus a clean-input negative case.
- `repeatDetector.test.ts` — exactly 2 events (no trigger), exactly 3 events (trigger), event older than 10 min excluded.
- `intentMatcher.test.ts` — one test per intent plus an unrecognised input.
- `answerFunction.test.ts` — complete profile, partial profile, empty profile.

**Property-based tests** (using `fast-check`, minimum 100 runs each):

Each test must be tagged with a comment: `// Feature: anchor-app, Property N: <property title>`

- **Property 1** — Life Profile storage round-trip (`storage.test.ts`)
- **Property 2** — Where-am-I answer contains both profile fields (`answerFunction.test.ts`)
- **Property 3** — What-day answer includes date and plan data (`answerFunction.test.ts`)
- **Property 4** — Who-is-here answer leads with caregiver name (`answerFunction.test.ts`)
- **Property 5** — Gentle response returned verbatim (`answerFunction.test.ts`)
- **Property 6** — Safety escalation is case-insensitive (`safetyChecker.test.ts`)
- **Property 7** — Repeat detector excludes stale events (`repeatDetector.test.ts`)
- **Property 8** — Repeat detector triggers at threshold (`repeatDetector.test.ts`)
- **Property 9** — Answer Function never exceeds two sentences (`answerFunction.test.ts`)
- **Property 10** — Unknown intent always returns fallback (`intentMatcher.test.ts`)

**Build gate:** `npm run test` (Vitest) runs in CI; `npm run build` fails if any test fails (Req 18.7).

**No visual regression or E2E tests** for the hackathon scope.
