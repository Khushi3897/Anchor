# Anchor: product overview

Anchor is a calm, caregiver-configured companion for a person living with dementia. It answers the questions they ask over and over ("Who are you?", "Where am I?", "What day is it?", "Where is Priya?") so caregivers don't have to, and it tells the caregiver when repetition may signal worry, pain, or another unmet need.

Tagline: Answers within reach.

## Users
- **Patient (primary screen):** an adult with mild-to-moderate dementia on a tablet or phone. Assume reduced vision and dexterity. They are never expected to type, log in, or navigate menus.
- **Caregiver (setup + dashboard):** a family member or aide, often exhausted. Setup must take under 10 minutes.

## MVP features
1. **Life profile (caregiver-entered):** preferred name, caregivers, where they live now, today's plan and visitors, important people with photos, comfort items, photo cards for reminiscence, and caregiver-written "gentle responses" for painful questions.
2. **Patient screen:** four huge buttons (Who is here? / Where am I? / What day is it? / Where is [caregiver]?), short large-text answers, read aloud, with a soft "Look at photos?" option afterward.
3. **Profile-grounded answers:** answers come only from the caregiver's profile, through templates and a keyword intent matcher (no cloud model needed). If the profile doesn't have it, Anchor says it will get the caregiver.
4. **Repeat detection:** when the same question comes up 3+ times in 10 minutes, the reply leads with comfort and the caregiver gets a check-in alert.
5. **Safety escalation:** pain, falls, leaving alone, or self-harm phrases trigger an immediate urgent caregiver alert. This runs in plain code before the model.
6. **Caregiver dashboard:** alerts (urgent first), question counts, time-of-day pattern, and an "Might be an unmet need?" checklist (hungry, thirsty, bathroom, pain, tired, lonely, noisy, too hot/cold).

## Non-goals
- Not a medical device. No diagnosis, medication, or treatment advice.
- Not an open-ended chatbot. It does not replace human company.
- No accounts, auth, or database for the hackathon. One household, local storage.
- No real patient data anywhere. Demo data is fictional.