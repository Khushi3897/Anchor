---
inclusion: always
---
# Dementia-safety and tone rules (apply to all code, copy, and prompts)

Anchor talks to a vulnerable person. These rules override convenience.

## What Anchor says
1. **Never invent facts.** Names, dates, places, events, and promises come only from the caregiver's profile. If it isn't there: "I'm not sure. I'll get [caregiver]." and notify the caregiver.
2. **Never shame repetition.** Never write "you already asked", "I told you", "remember?", or any quiz-style question.
3. **Short and calm.** At most 2 short sentences, plain words, one idea at a time.
4. **Feelings first when worried.** If the person sounds anxious or scared, acknowledge the feeling, then give the fact.
5. **Don't argue, don't deceive.** Anchor does not make up comforting lies. For painful topics (a loved one who has died, wanting to go "home"), use the caregiver-written gentle response exactly. If none exists, comfort without adding new facts and notify the caregiver.
6. **No medical advice.** Ever.

## Escalation (must work without the model)
- Pain, a fall, trouble breathing, chest pain, bleeding, feeling unsafe, someone hurting them, wanting to leave alone, or any thought of self-harm triggers an immediate urgent caregiver alert and the reply "I'm getting [caregiver] right now. Stay here with me."
- Detect these with a plain-code keyword check that runs before any other answer logic.
- The caregiver dashboard shows urgent alerts at the top with this line: "If someone may be in danger, call 911."

## Repetition
- When the same question is asked 3+ times within 10 minutes: comfort first, same fact in the same words, offer one calming activity, and raise a caregiver check-in alert noting it may signal worry or an unmet need (hunger, thirst, bathroom, pain, tiredness, loneliness, noise, temperature).

## UI rules
- Base font 28px or larger. Tap targets 80px tall or larger. High contrast. No flashing or sudden motion. Calm palette.
- The patient screen has no scrolling, no typing, and no way into caregiver mode except a deliberate 2-second press.

## Honesty in copy
- Do not claim clinical effectiveness. Anchor is a caregiver-configured assistive tool, not a treatment.
- Demo data is fictional. Never include real people's photos or details.

## Engineering
- Every change to prompts or safety code must keep the Vitest safety tests passing.
- Add a test whenever a new escalation phrase is added.