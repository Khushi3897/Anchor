// src/lib/intentMatcher.ts — keyword-based intent classification
// Maps free-form Patient text to one of the four defined QuestionIntents.

import type { QuestionIntent } from './types'

const WHO_KEYWORDS = ['who', 'here', 'with me', 'around', 'visiting', 'who is']
const WHERE_AM_I_KEYWORDS = [
  'where am i', 'where are we', 'where is this', 'what place', 'am i home',
  'this place', 'what room', 'where do i live',
]
const WHAT_DAY_KEYWORDS = [
  'what day', 'what date', "what's today", 'what is today',
  'what time', 'today', 'date', 'when is',
]
const WHERE_CAREGIVER_KEYWORDS = [
  'where is', 'where are', 'where did', 'find', 'looking for',
  'caregiver', 'nurse', 'helper', 'carer',
]

// Painful / gentle-response topics (not mapped to a standard intent but checked here
// so callers can detect them; actual gentle response lookup happens in answerFunction)
export const PAINFUL_TOPIC_KEYWORDS = [
  'mum', 'mom', 'mother', 'dad', 'father', 'husband', 'wife',
  'go home', 'want to go home', 'take me home', 'my house',
  'died', 'dead', 'passed away', 'gone',
]

export function matchIntent(input: string): QuestionIntent {
  const lower = input.toLowerCase()

  // Check more-specific patterns first to avoid false positives
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

  return 'unknown'
}

/** Returns true if the input appears to reference a painful topic */
export function isPainfulTopic(input: string): boolean {
  const lower = input.toLowerCase()
  return PAINFUL_TOPIC_KEYWORDS.some((kw) => lower.includes(kw))
}
