# Requirements Document

## Introduction

Anchor is a calm, caregiver-configured companion for a person living with dementia. It answers
repeated questions ("Who is here?", "Where am I?", "What day is it?", "Where is [caregiver]?")
from a static life profile so caregivers don't have to keep answering. Everything runs in the
browser — no server, no database, no API keys. Two modes exist: a full-screen Patient Screen the
person with dementia uses, and a Caregiver Setup area reached only by holding a small lock icon
for two seconds. Answers are produced by a deterministic function driven by the caregiver's
profile; the app never invents facts. Safety escalation and repeat detection are plain-code checks
that run before any answer is produced.

## Glossary

- **App**: The Anchor React + Vite + TypeScript single-page application.
- **Patient**: An adult living with mild-to-moderate dementia who uses the Patient Screen.
- **Caregiver**: A family member or care aide who configures the Life Profile and receives alerts.
- **Life Profile**: The set of caregiver-entered data stored in browser localStorage that drives all answers.
- **Patient Screen**: The full-screen, no-scroll, no-type view the Patient uses.
- **Caregiver Setup**: The configuration area accessible only via a deliberate 2-second lock-icon hold.
- **Answer Function**: The deterministic, profile-driven function that produces all Patient Screen answers.
- **Intent Matcher**: The keyword-based classifier that maps free-form Patient input to one of the four defined question intents.
- **Safety Checker**: The plain-code keyword check that runs before the Answer Function and triggers urgent escalation.
- **Repeat Detector**: The component that tracks question events and fires a caregiver check-in alert when the same intent is asked 3 or more times within 10 minutes.
- **Caregiver Alert**: A record written to localStorage (and surfaced on the Caregiver Dashboard) categorised as either urgent or check-in.
- **Caregiver Dashboard**: The section of Caregiver Setup that shows all alerts, question-count summaries, and time-of-day patterns.
- **Photo Slideshow**: The optional calm full-screen slideshow of profile photos with captions, shown after an answer on the Patient Screen.
- **Demo Persona**: A completely fictional Life Profile loaded by pressing "Load demo persona" in Caregiver Setup.

---

## Requirements

### Requirement 1: Life Profile — Core Identity

**User Story:** As a Caregiver, I want to enter the patient's preferred name and my own details,
so that Anchor addresses the patient correctly and answers "Who is here?" with accurate information.

#### Acceptance Criteria

1. THE Caregiver Setup SHALL provide input fields for the patient's preferred name (1–50 characters), at least one caregiver's name (1–50 characters), caregiver relationship (1–30 characters), caregiver phone number, and a caregiver photo upload (JPEG or PNG, stored as data URL).
2. WHEN a Caregiver uploads a photo, THE App SHALL store the image as a data URL in the Life Profile inside localStorage and display a preview within Caregiver Setup.
3. THE App SHALL persist every saved field of the Life Profile to localStorage so that data survives a page refresh.
4. WHEN the Life Profile contains a caregiver name, THE Patient Screen SHALL display that name on the "Where is [caregiver]?" button label.
5. IF a required identity field (patient name or primary caregiver name) is empty when the Caregiver saves the profile, THEN THE Caregiver Setup SHALL display an inline validation message identifying each missing field by name and SHALL NOT overwrite the previously saved profile.

---

### Requirement 2: Life Profile — Location and Reassurance

**User Story:** As a Caregiver, I want to enter where the patient lives and a one-sentence reassurance,
so that Anchor answers "Where am I?" with a calm, accurate, caregiver-approved response.

#### Acceptance Criteria

1. THE Caregiver Setup SHALL provide a free-text field (up to 150 characters) for a one-sentence description of where the patient lives now.
2. THE Caregiver Setup SHALL provide a free-text field (up to 150 characters) for a one-sentence reassurance statement (e.g. "You are safe at home.").
3. WHEN a Patient taps "Where am I?", THE Answer Function SHALL construct the answer by combining the location text followed by the reassurance text, using only those two fields from the Life Profile, with no additional invented phrasing.
4. IF the location field is empty and the reassurance field is populated, THEN THE Answer Function SHALL return only the reassurance text and SHALL write a check-in Caregiver Alert to localStorage.
5. IF both the location field and the reassurance field are empty, THEN THE Answer Function SHALL return "I'll get [caregiver name]." and SHALL write a check-in Caregiver Alert to localStorage.

---

### Requirement 3: Life Profile — Today Card

**User Story:** As a Caregiver, I want to describe today's plan and expected visitors,
so that the patient hears an accurate, grounding summary when asking "What day is it?".

#### Acceptance Criteria

1. WHEN the app is launched or the displayed date becomes stale (device clock has rolled past midnight since last render), THE App SHALL auto-fill the current weekday name and full date (e.g. "Friday, 23 October 2026") by reading the device clock, without requiring any network call.
2. THE Caregiver Setup SHALL provide a free-text field (up to 280 characters) for today's plan.
3. THE Caregiver Setup SHALL allow the Caregiver to add up to 10 expected visitor entries, each with a visitor name (up to 50 characters) and an optional arrival time (free text, up to 20 characters, e.g. "2:00 pm").
4. WHEN a Patient taps "What day is it?", THE Answer Function SHALL produce an answer of at most two sentences that includes the current weekday and date (from the device clock), the today's plan text (if present), and the names and arrival times of any visitors (if present), using only data from the Life Profile and the device clock.
5. IF the today's plan field is empty but at least one visitor entry exists, THEN THE Answer Function SHALL include only the weekday, date, and visitor information, without fabricating any plan text.
6. IF both the today's plan field is empty and no visitor entries exist, THEN THE Answer Function SHALL return only the current weekday and date, without fabricating any additional content.

---

### Requirement 4: Life Profile — People

**User Story:** As a Caregiver, I want to add important people with photos and a warm description,
so that Anchor can show who is present and give the patient a familiar face with context.

#### Acceptance Criteria

1. THE Caregiver Setup SHALL allow the Caregiver to add up to 20 People entries, each containing a name (1–50 characters), a relationship label (1–30 characters), an optional photo upload (JPEG or PNG), and one warm sentence about that person (1–100 characters).
2. WHEN a Patient taps "Who is here?", THE Answer Function SHALL compose the answer by naming the primary caregiver first (using the caregiver name from the Life Profile), followed by at most two People entries in entry order (name and relationship each), in at most two sentences total, using only data from the Life Profile.
3. IF the first People entry has a photo, THEN THE Patient Screen SHALL display that photo alongside the answer text.
4. IF no People entry has a photo, THEN THE Patient Screen SHALL display the answer text without a photo and SHALL NOT show a broken-image placeholder.
5. IF no People entries exist in the Life Profile, THEN THE Answer Function SHALL return "I'll get [primary caregiver name from the Life Profile]." and SHALL write a check-in Caregiver Alert to localStorage.

---

### Requirement 5: Life Profile — Comfort Items and Photo Cards

**User Story:** As a Caregiver, I want to record the patient's favourite things and add photo cards,
so that reminiscence content is available on the Patient Screen after each answer.

#### Acceptance Criteria

1. WHEN the Caregiver opens the Life Profile editor, THE Caregiver Setup SHALL display exactly five free-text fields for favourite comfort items, each accepting up to 60 characters.
2. WHEN the Caregiver adds a photo card, THE App SHALL accept a JPEG or PNG image upload and a caption of up to 80 characters, and SHALL store the image as a data URL in the Life Profile.
3. IF the Caregiver attempts to add a seventh photo card, THEN THE Caregiver Setup SHALL prevent the addition and display an inline message stating that the maximum of six photo cards has been reached.
4. WHEN the Life Profile is saved, THE App SHALL include all comfort item text values and all photo card data URLs and captions in the localStorage record for the Life Profile.

---

### Requirement 6: Life Profile — Gentle Responses

**User Story:** As a Caregiver, I want to write the exact reply Anchor uses for painful questions,
so that the patient receives a compassionate, caregiver-approved response rather than a fabricated one.

#### Acceptance Criteria

1. THE Caregiver Setup SHALL allow the Caregiver to add up to 20 Gentle Response entries, each with a trigger topic label of 1–60 characters and an exact reply text of 1–300 characters, and SHALL prevent saving an entry with a blank label or blank reply text.
2. WHEN the Intent Matcher classifies a Patient's question as matching a Gentle Response trigger topic, THE Answer Function SHALL return the caregiver-written reply text verbatim for the first-added matching entry, without alteration to wording, punctuation, or capitalisation.
3. IF a Patient's question is classified as a painful topic by the keyword intent matcher but no Gentle Response entry matches that topic, THEN THE Answer Function SHALL return a fixed comfort phrase that contains no names, dates, or facts beyond what is already displayed on the Patient screen, and SHALL write a check-in Caregiver Alert to localStorage containing the detected topic label and the UTC timestamp of the question.
4. THE App SHALL never modify or paraphrase a caregiver-written Gentle Response before displaying it as text or passing it to speech synthesis.

---

### Requirement 7: Demo Persona

**User Story:** As a Caregiver, I want to load fictional demo data in one click,
so that I can see how Anchor works without entering real patient information.

#### Acceptance Criteria

1. THE Caregiver Setup SHALL display a "Load demo persona" button.
2. WHEN the Caregiver presses "Load demo persona" and no existing profile data is present, THE App SHALL populate all Life Profile fields — preferred name, caregiver names, current location, today's plan and visitors, at least two important people entries with placeholder images, at least one comfort item, at least three photo cards with placeholder images and captions, and at least one caregiver-written gentle response — with completely fictional content and persist the populated profile to localStorage.
3. IF the Caregiver presses "Load demo persona" and existing profile data is already stored in localStorage, THEN THE App SHALL display a confirmation prompt warning that the existing profile will be replaced, and SHALL overwrite the profile only if the Caregiver confirms.
4. THE Demo Persona SHALL NOT contain any real person's name, likeness, or personal details.
5. WHILE the demo persona is active, THE Caregiver Setup SHALL display a persistent notice stating that the data shown is fictional and for demonstration purposes only, and this notice SHALL remain visible for the entire session without requiring dismissal.

---

### Requirement 8: Caregiver Mode Access Control

**User Story:** As a Caregiver, I want setup to be inaccessible to the patient during normal use,
so that the patient cannot accidentally change settings or leave the Patient Screen.

#### Acceptance Criteria

1. THE Patient Screen SHALL display a small lock icon (no larger than 32×32 CSS pixels) that carries no visible text label.
2. WHEN a user holds the lock icon for a continuous 2 seconds, THE App SHALL transition to Caregiver Setup.
3. IF the lock icon press is released before 2 seconds have elapsed, THE App SHALL remain on the Patient Screen and SHALL NOT navigate to Caregiver Setup.
4. THE Caregiver Setup SHALL display a clearly labelled "Back to patient screen" control that returns the App to the Patient Screen in one tap.
5. THE Patient Screen SHALL provide no other navigation controls, menus, or links capable of reaching Caregiver Setup or any other view.

---

### Requirement 9: Patient Screen Layout and Accessibility

**User Story:** As a Patient, I want a simple screen with large controls,
so that I can tap an answer without confusion or dexterity difficulty.

#### Acceptance Criteria

1. THE Patient Screen SHALL display exactly four answer buttons: "Who is here?", "Where am I?", "What day is it?", and "Where is [caregiver name]?" (substituting "your caregiver" if no caregiver name is present in the Life Profile).
2. THE App SHALL render all Patient Screen text at a minimum font size of 28 CSS pixels.
3. THE App SHALL render all Patient Screen tap targets at a minimum height of 80 CSS pixels and a minimum width of 200 CSS pixels.
4. THE Patient Screen SHALL use a colour palette where text and interactive elements meet WCAG AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text and UI components), with no flashing effects and no CSS transitions faster than 200 milliseconds.
5. THE Patient Screen SHALL NOT include any scrollable region.
6. THE Patient Screen SHALL include one large "Ask Anchor" text input field and a "Send" button (each with a minimum tap target of 80 CSS pixels tall) as the sole text-entry mechanism on the screen; no other text-input field SHALL be present.
7. THE Patient Screen SHALL never display an unhandled error or a blank screen; IF any runtime error occurs, THEN THE App SHALL display the calm fallback message "I'm here. I'll get [caregiver name]." using the caregiver name from the Life Profile, or "I'm here. I'll get your caregiver." if the name is unavailable.

---

### Requirement 10: Answer Display

**User Story:** As a Patient, I want to see a short, clear answer with a photo,
so that the response is easy to read and recognise.

#### Acceptance Criteria

1. WHEN a Patient taps an answer button, THE Patient Screen SHALL display the answer text (at most two short sentences) in a large-text panel rendered at a minimum of 28 CSS pixels.
2. WHEN the Life Profile contains a photo tagged as relevant to the tapped question intent, THE Patient Screen SHALL display that photo alongside the answer text; IF no relevant photo exists, THEN THE Patient Screen SHALL display only the answer text without a broken-image placeholder.
3. WHILE the answer panel is displayed, THE Patient Screen SHALL show a "Replay" button with a minimum tap target of 80 CSS pixels tall that re-reads the answer aloud when tapped.
4. THE Patient Screen SHALL display a persistent mute toggle button with a minimum tap target of 80 CSS pixels tall; WHEN the mute toggle is active, THE App SHALL suppress all speech synthesis output.
5. WHEN the answer panel is displayed and at least one photo card exists in the Life Profile, THE Patient Screen SHALL show a "Look at photos?" option with a minimum tap target of 80 CSS pixels tall that opens the photo cards view.
6. WHEN the Patient taps outside the answer panel or taps a dedicated close control, THE Patient Screen SHALL dismiss the answer panel and return to the four-button default state.

---

### Requirement 11: Speech Synthesis

**User Story:** As a Patient, I want the answer read aloud automatically,
so that I can hear it even if reading is difficult.

#### Acceptance Criteria

1. WHEN an answer is shown and the mute toggle is not active, THE App SHALL immediately use the browser's built-in SpeechSynthesis API to read the answer text aloud.
2. IF the mute toggle is active when an answer is shown, THEN THE App SHALL display the answer text without initiating any speech synthesis.
3. WHEN a Patient taps the "Replay" button and the mute toggle is not active, THE App SHALL re-read the current answer aloud using SpeechSynthesis; IF the mute toggle is active, THE App SHALL take no action on the audio channel.
4. WHEN a new answer is triggered while speech is already in progress, THE App SHALL cancel the in-progress speech before beginning the new utterance.
5. THE App SHALL NOT require any network connection or external API to produce speech output, and SHALL use only device built-in voices available via the SpeechSynthesis API.
6. IF the browser does not support SpeechSynthesis, THEN THE App SHALL display the answer text only and SHALL NOT show any error message related to speech.
7. THE mute toggle SHALL default to unmuted (speech enabled) when the app is first loaded.

---

### Requirement 12: Photo Slideshow

**User Story:** As a Patient, I want to look at familiar photos after getting an answer,
so that I have a calming reminiscence activity available.

#### Acceptance Criteria

1. WHEN a Patient taps "Look at photos?", THE App SHALL display a full-screen Photo Slideshow showing each photo card image and caption from the Life Profile in entry order.
2. THE Photo Slideshow SHALL auto-advance to the next photo at a consistent interval of no less than 5 seconds and no more than 10 seconds per photo, without requiring any Patient interaction.
3. WHEN the slideshow reaches the last photo, THE App SHALL loop back to the first photo and continue auto-advancing.
4. THE Photo Slideshow SHALL display a close control labelled "Close" with a minimum tap target of 80 CSS pixels tall that returns the Patient Screen to its four-button default state when tapped.
5. THE Photo Slideshow SHALL use only cross-fade transitions between photos; the cross-fade duration SHALL be no shorter than 0.5 seconds and no longer than 1 second; no other transition type SHALL be used.
6. IF a photo card has a missing or unloadable image, THEN THE Slideshow SHALL display the caption text against a plain background for that slide and SHALL NOT show a broken-image indicator.
7. IF no photo cards have been added to the Life Profile, THEN THE App SHALL NOT display the "Look at photos?" option.

---

### Requirement 13: Safety Escalation

**User Story:** As a Caregiver, I want Anchor to immediately alert me if the patient expresses pain, a fall, or self-harm,
so that I can respond before any delay introduced by answer logic.

#### Acceptance Criteria

1. THE Safety Checker SHALL execute as the first step of every question-handling flow, before the Intent Matcher or Answer Function.
2. WHEN the Safety Checker detects a keyword or phrase indicating pain, a fall, trouble breathing, chest pain, bleeding, feeling unsafe, someone hurting them, wanting to leave alone, or self-harm, THE App SHALL display the reply "I'm getting [caregiver name] right now. Stay here with me." (substituting "my caregiver" if the caregiver name is absent from the Life Profile) within 1 second and SHALL simultaneously initiate speech synthesis of that reply.
3. WHEN a safety escalation is triggered, THE App SHALL write an urgent Caregiver Alert to localStorage containing the UTC timestamp and the exact phrase that triggered the escalation.
4. THE Safety Checker SHALL operate using only plain-code case-insensitive keyword matching, with no dependency on any external model or network call; keyword matching SHALL be case-insensitive so that "FALL", "Fall", and "fall" all trigger the same escalation.
5. THE Caregiver Dashboard SHALL display all urgent alerts at the top of the alert list in a minimum 28 CSS pixel high-contrast font, with the line "If someone may be in danger, call 911." appearing above the first urgent alert.
6. IF speech synthesis fails or is unavailable during a safety escalation, THEN THE App SHALL still display the escalation reply text visually and SHALL NOT suppress the on-screen message.

---

### Requirement 14: Repeat Detection

**User Story:** As a Caregiver, I want to know when the patient asks the same question repeatedly,
so that I can check for an unmet need.

#### Acceptance Criteria

1. THE App SHALL log every question event with its intent classification and an ISO 8601 timestamp to localStorage.
2. THE Repeat Detector SHALL count question events per intent within a rolling 10-minute window, excluding events whose timestamp is more than 10 minutes before the current event's timestamp.
3. WHEN the Repeat Detector counts 3 or more events for the same intent within 10 minutes, THE App SHALL prepend a comfort phrase (acknowledging the patient's feeling without referencing prior asking) before the factual answer on that occurrence and on every subsequent occurrence while the window remains active, and SHALL offer one calming activity at the end of the response.
4. WHEN repeat detection fires, THE App SHALL write a check-in Caregiver Alert (distinct from urgent escalation alerts) to localStorage containing the intent identifier, the event count, the window start timestamp, and a message that the repetition may signal an unmet need (hunger, thirst, bathroom, pain, tiredness, loneliness, noise, or temperature).
5. THE App SHALL never display the words "you already asked", "I told you", "remember", or any quiz-style phrasing to the Patient.
6. IF the comfort phrase pool is unavailable or empty for any reason, THE App SHALL fall back to displaying the factual answer alone without any error visible to the Patient.

---

### Requirement 15: Caregiver Dashboard

**User Story:** As a Caregiver, I want to see all alerts and question patterns in one place,
so that I can spot trends and respond to unmet needs.

#### Acceptance Criteria

1. THE Caregiver Dashboard SHALL display all Caregiver Alerts sorted with urgent alerts first, then check-in alerts in reverse-chronological order, each showing the alert type, message, and ISO 8601 timestamp.
2. THE Caregiver Dashboard SHALL display a question-count summary showing how many times each of the four intents was asked today (since midnight on the device clock).
3. THE Caregiver Dashboard SHALL display a time-of-day pattern showing question event frequency grouped by hour of day (0–23) for all events recorded in localStorage.
4. WHEN any urgent alert exists in localStorage, THE Caregiver Dashboard SHALL display the line "If someone may be in danger, call 911." as the first visible element of the alert list, in a minimum 28 CSS pixel high-contrast font.
5. THE Caregiver Dashboard SHALL display an "Unmet need?" checklist containing exactly the following items as interactive checkboxes: hungry, thirsty, bathroom, pain, tired, lonely, noisy, too hot/cold.

---

### Requirement 16: Deterministic Answer Function

**User Story:** As a Caregiver, I want Anchor to only say things I have entered in the profile,
so that the patient is never confused by invented information.

#### Acceptance Criteria

1. THE Answer Function SHALL produce all answers using only verbatim field values or direct combinations of field values from the Life Profile stored in localStorage, without paraphrasing, inferring, or generating any name, date, place, event, or promise not explicitly present in the Life Profile.
2. IF no Life Profile field maps to the identified question intent, THEN THE Answer Function SHALL treat the question as unanswerable and SHALL return "I'll get [caregiver name]." (or "I'll get your caregiver." if the name is also missing), and SHALL write a check-in Caregiver Alert entry to localStorage containing the unanswered intent identifier and a UTC timestamp.
3. THE App SHALL NOT make any network request to produce an answer.
4. FOR ALL valid Life Profile inputs, THE Answer Function SHALL return a string containing at most two sentences, where a sentence is defined as a sequence of characters ending with a period, question mark, or exclamation point.

---

### Requirement 17: Offline Operation

**User Story:** As a Caregiver, I want the app to work without internet,
so that it is always available regardless of connectivity.

#### Acceptance Criteria

1. THE App SHALL operate all subsystems — including Life Profile storage, answer generation, safety-keyword escalation, caregiver alert storage, and speech synthesis — using only locally stored data and bundled assets, with no active network connection required at any point after the app has been installed or first loaded.
2. THE App SHALL NOT require any external CDN resource, API call, or remote asset to render or operate the Patient Screen after first load.
3. THE App SHALL use only device built-in voices available via the SpeechSynthesis API and SHALL NOT initiate any network request to fetch remote voice data.
4. IF any network request fails for any reason, THE App SHALL continue operating normally and SHALL display the calm fallback response ("I'm here. I'll get [caregiver name].") on the Patient Screen without showing any network error message or connectivity indicator.

---

### Requirement 18: Vitest Test Coverage

**User Story:** As a developer, I want automated tests for the core logic,
so that safety and correctness properties are verified on every build.

#### Acceptance Criteria

1. THE App SHALL include at least one passing Vitest unit test per phrase category for the Safety Checker, covering: pain expressions, fall reports, self-harm statements, and "leave alone" phrases.
2. THE App SHALL include at least one passing Vitest unit test per scenario for the Repeat Detector, covering: exactly 2 identical intents in 10 minutes (does not trigger), exactly 3 identical intents in 10 minutes (triggers), and an event older than 10 minutes being excluded from the rolling window count.
3. THE App SHALL include at least one passing Vitest unit test per intent for the Intent Matcher, covering: the "who is here" intent, the "where am I" intent, the "what day is it" intent, the "where is caregiver" intent, and an input string that matches none of the four intents.
4. THE App SHALL include at least one passing Vitest unit test per profile state for the Answer Function, covering: a complete Life Profile (all fields populated), a partial Life Profile (at least one required field absent), and an empty Life Profile (no fields populated).
5. IF the Safety Checker receives an input string containing a known escalation phrase, THEN it SHALL return a result object with the boolean field `escalation` set to `true`.
6. IF the Repeat Detector receives a sequence of 3 or more question events sharing the same intent identifier within a 10-minute window, THEN it SHALL return `true`.
7. THE build process SHALL fail if any Vitest test does not pass, ensuring no commit can introduce a regression in safety or correctness logic.
### Requirement 19: Ask Anchor — Free-Text Question Handling

**User Story:** As a Patient, I want to type a question in my own words and get a calm answer,
so that I can ask about things not covered by the four preset buttons.

#### Acceptance Criteria

1. WHEN a Patient submits text via the "Ask Anchor" field and Send button, THE App SHALL pass the input text through the Safety Checker first, then the Intent Matcher, then the Answer Function, in that order, before producing any visible response.
2. IF the Safety Checker detects an escalation phrase in the submitted text, THEN THE App SHALL immediately display and speak the escalation reply and SHALL NOT continue to the Intent Matcher or Answer Function.
3. WHEN the Intent Matcher maps the submitted text to one of the four defined question intents (who is here, where am I, what day is it, where is caregiver), THE Answer Function SHALL return the profile-grounded answer for that intent.
4. IF the Intent Matcher cannot map the submitted text to any of the four defined intents, THEN THE Answer Function SHALL return "I'll get [caregiver name]." (or "I'll get your caregiver." if the caregiver name is absent from the Life Profile) and SHALL write a check-in Caregiver Alert to localStorage containing the unrecognised input text and a UTC timestamp.
5. IF the Intent Matcher maps the submitted text to a painful topic that has a matching Gentle Response entry in the Life Profile, THEN THE Answer Function SHALL return that caregiver-written gentle response verbatim.
6. WHEN a question is submitted via the "Ask Anchor" field, THE App SHALL clear the text input field after the answer is displayed.
7. THE "Ask Anchor" field SHALL accept input of up to 200 characters.
