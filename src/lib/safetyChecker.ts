// src/lib/safetyChecker.ts — plain-code keyword safety escalation
// Runs BEFORE the Intent Matcher and Answer Function. No network. No model.

export interface SafetyResult {
  escalation: boolean
  triggerPhrase?: string
}

// Keywords are matched case-insensitively.
// Add new phrases here — every addition must have a corresponding Vitest test.
const SAFETY_KEYWORDS: string[] = [
  // pain
  'hurt', 'hurts', 'hurting', 'pain', 'painful', 'ache', 'aching', 'sore',
  // fall
  'fell', 'fallen', 'fall', 'falling', 'slipped', 'tripped',
  // breathing / chest
  "can't breathe", "cannot breathe", "can not breathe", 'chest pain', 'chest hurts',
  'trouble breathing', 'hard to breathe', 'short of breath', 'out of breath',
  // bleeding
  'bleed', 'bleeding', 'blood',
  // unsafe / someone hurting them
  'unsafe', "don't feel safe", 'feel unsafe', 'not safe', 'scared', 'someone hurt',
  'someone is hurting', 'hurting me', 'hitting me',
  // leaving alone
  'leave alone', 'leaving alone', 'want to leave', 'go alone',
  // self-harm
  'harm myself', 'hurt myself', 'kill myself', 'want to die', 'dying',
  'end it', 'not worth living',
]

export function checkSafety(input: string): SafetyResult {
  const lower = input.toLowerCase()
  for (const keyword of SAFETY_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      return { escalation: true, triggerPhrase: keyword }
    }
  }
  return { escalation: false }
}
