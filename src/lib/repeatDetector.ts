// src/lib/repeatDetector.ts — rolling-window repeat detection

import type { QuestionIntent, QuestionEvent } from './types'

export interface RepeatResult {
  isRepeat: boolean   // true when count >= 3 in 10-minute window
  count: number
  windowStart: string // ISO 8601 of earliest event in window
}

const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export function checkRepeat(
  intent: QuestionIntent,
  events: QuestionEvent[],
  nowMs?: number, // injectable for testing
): RepeatResult {
  const now = nowMs ?? Date.now()
  const cutoff = now - WINDOW_MS

  const inWindow = events.filter(
    (e) => e.intent === intent && new Date(e.timestamp).getTime() > cutoff,
  )

  const count = inWindow.length
  const windowStart =
    inWindow.length > 0
      ? inWindow.reduce((earliest, e) =>
          e.timestamp < earliest.timestamp ? e : earliest,
        ).timestamp
      : new Date(now).toISOString()

  return {
    isRepeat: count >= 3,
    count,
    windowStart,
  }
}
