// src/lib/intentMatcher.ts — keyword-based intent classification
// Maps free-form Patient text to one of the defined QuestionIntents.

import type { QuestionIntent } from './types'

// ── Intent keyword groups (checked most-specific first) ───────────────────────

const WHERE_AM_I_KEYWORDS = [
  'where am i', 'where are we', 'where is this', 'what place', 'am i home',
  'this place', 'what room', 'where do i live', 'what is this place',
]

const WHAT_DAY_KEYWORDS = [
  'what day', 'what date', "what's today", 'what is today',
  'what time', 'today', 'when is',
]

const WHERE_CAREGIVER_KEYWORDS = [
  'where is', 'where are', 'where did', 'looking for',
  'caregiver', 'nurse', 'helper', 'carer',
]

const WHO_KEYWORDS = [
  'who is here', 'who is with me', 'who are you', 'who is around',
  'who is visiting', 'who is that', 'who is in',
]

// Feeling / emotional wellbeing
const FEELING_KEYWORDS = [
  'i feel', 'feeling', 'am i okay', 'am i all right', 'i am worried',
  'i am anxious', 'i am confused', 'i am upset', 'i am sad', 'i am lonely',
  'something is wrong', 'not right',
]

// Asking about a specific named person (handled by gentle responses or people list)
const PERSON_KEYWORDS = [
  'mum', 'mom', 'mother', 'dad', 'father', 'husband', 'wife', 'son', 'daughter',
  'sister', 'brother', 'friend', 'george', 'rosie', // common demo names
]

// Painful topics — "go home" is a gentle-response topic, NOT a safety escalation
export const PAINFUL_TOPIC_KEYWORDS = [
  'go home', 'want to go home', 'take me home', 'my old house', 'my house',
  'died', 'dead', 'passed away', 'gone',
  'mum', 'mom', 'mother', 'dad', 'father', 'husband', 'wife',
]

export function matchIntent(input: string): QuestionIntent {
  const lower = input.toLowerCase()

  // Most-specific first to avoid false positives on short words
  for (const kw of WHERE_AM_I_KEYWORDS) {
    if (lower.includes(kw)) return 'where-am-i'
  }
  for (const kw of WHAT_DAY_KEYWORDS) {
    if (lower.includes(kw)) return 'what-day'
  }
  for (const kw of WHERE_CAREGIVER_KEYWORDS) {
    if (lower.includes(kw)) return 'where-caregiver'
  }
  for (const kw of WHO_KEYWORDS) {
    if (lower.includes(kw)) return 'who'
  }
  for (const kw of FEELING_KEYWORDS) {
    if (lower.includes(kw)) return 'feeling'
  }
  // 'person' intent: asking about a specific named/related person
  for (const kw of PERSON_KEYWORDS) {
    if (lower.includes(kw)) return 'person'
  }

  return 'unknown'
}

/** Returns true if the input appears to reference a painful topic */
export function isPainfulTopic(input: string): boolean {
  const lower = input.toLowerCase()
  return PAINFUL_TOPIC_KEYWORDS.some((kw) => lower.includes(kw))
}
