// src/lib/safetyChecker.ts — plain-code keyword safety escalation
// Runs BEFORE the Intent Matcher and Answer Function. No network. No model.
// IMPORTANT: "go home" and "want to go home" are painful topics, NOT safety escalations
// (they are handled by gentle responses). Only "go home alone" / "leave alone" escalates.

export interface SafetyResult {
  escalation: boolean
  triggerPhrase?: string
}

// Keywords matched case-insensitively via input.toLowerCase().includes(keyword).
// Every addition here needs a corresponding Vitest test.
export const SAFETY_KEYWORDS: string[] = [
  // pain
  'i am in pain', 'in pain', 'pain', 'hurts', 'hurting', 'painful', 'ache', 'aching', 'sore',
  // fall
  'i fell', 'have fallen', 'fell down', 'fell over', 'i fall', 'falling down', 'slipped', 'tripped',
  // breathing / chest  (standalone 'chest' included per spec)
  "can't breathe", "cannot breathe", "can not breathe",
  'chest pain', 'chest hurts', 'chest feels', 'chest',
  'trouble breathing', 'hard to breathe', 'short of breath', 'out of breath',
  // bleeding
  'bleeding', 'blood',
  // scared / someone hurting them
  'i feel scared', 'i am scared', 'so scared', 'scared',
  'someone hurt me', 'someone is hurting me', 'hurting me', 'hitting me',
  // leaving ALONE (distinct from "go home" which is a gentle-response topic)
  'leave alone', 'leaving alone', 'go home alone', 'go out alone', 'leave by myself',
  // self-harm / want to die
  'harm myself', 'hurt myself', 'kill myself', 'want to die', 'want to hurt myself',
  'end it all', 'end my life', 'not worth living',
]

export function checkSafety(input: string): SafetyResult {
  const lower = input.toLowerCase()
  for (const keyword of SAFETY_KEYWORDS) {
    if (lower.includes(keyword)) {
      return { escalation: true, triggerPhrase: keyword }
    }
  }
  return { escalation: false }
}
