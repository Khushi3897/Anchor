// Feature: anchor-app
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { checkRepeat } from '../lib/repeatDetector'
import type { QuestionEvent, QuestionIntent } from '../lib/types'

const NOW = new Date('2026-10-23T12:00:00.000Z').getTime()
const INTENTS: QuestionIntent[] = ['who', 'where-am-i', 'what-day', 'where-caregiver']

function makeEvent(intent: QuestionIntent, offsetMs: number): QuestionEvent {
  return {
    intent,
    timestamp: new Date(NOW - offsetMs).toISOString(),
    rawInput: 'test',
  }
}

// ── Unit tests (Requirement 18.2, 18.6) ──────────────────────────────────────

describe('Repeat Detector — unit tests', () => {
  it('does NOT trigger with exactly 2 events in window', () => {
    const events = [makeEvent('who', 60_000), makeEvent('who', 120_000)]
    const result = checkRepeat('who', events, NOW)
    expect(result.isRepeat).toBe(false)
    expect(result.count).toBe(2)
  })

  it('DOES trigger with exactly 3 events in window', () => {
    const events = [
      makeEvent('who', 60_000),
      makeEvent('who', 120_000),
      makeEvent('who', 180_000),
    ]
    const result = checkRepeat('who', events, NOW)
    expect(result.isRepeat).toBe(true)
    expect(result.count).toBe(3)
  })

  it('excludes events older than 10 minutes from the count', () => {
    const staleOffset = 10 * 60 * 1000 + 1 // just over 10 min ago
    const events = [
      makeEvent('who', 60_000),   // in window
      makeEvent('who', 120_000),  // in window
      makeEvent('who', staleOffset), // STALE — must be excluded
    ]
    const result = checkRepeat('who', events, NOW)
    expect(result.isRepeat).toBe(false)
    expect(result.count).toBe(2)
  })

  it('ignores events for a different intent', () => {
    const events = [
      makeEvent('where-am-i', 60_000),
      makeEvent('where-am-i', 120_000),
      makeEvent('where-am-i', 180_000),
    ]
    const result = checkRepeat('who', events, NOW)
    expect(result.isRepeat).toBe(false)
    expect(result.count).toBe(0)
  })

  it('returns isRepeat false for empty event list', () => {
    const result = checkRepeat('who', [], NOW)
    expect(result.isRepeat).toBe(false)
    expect(result.count).toBe(0)
  })
})

// ── Property 7: Repeat detector excludes stale events ────────────────────────
// Feature: anchor-app, Property 7: Repeat detector excludes stale events

describe('Property 7 — Repeat detector excludes stale events', () => {
  it('never counts events older than 10 minutes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTENTS),
        fc.integer({ min: 1, max: 10 }),
        (intent, staleCount) => {
          // Build only stale events (older than 10 min + 1 ms)
          const staleEvents: QuestionEvent[] = Array.from({ length: staleCount }, (_, i) =>
            makeEvent(intent, 10 * 60 * 1000 + 1000 * (i + 1)),
          )
          const result = checkRepeat(intent, staleEvents, NOW)
          return result.count === 0 && result.isRepeat === false
        },
      ),
      { numRuns: 200 },
    )
  })
})

// ── Property 8: Repeat detector triggers at threshold ────────────────────────
// Feature: anchor-app, Property 8: Repeat detector triggers at threshold

describe('Property 8 — Repeat detector triggers at threshold', () => {
  it('returns isRepeat true for 3+ same-intent events within 10 minutes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTENTS),
        fc.integer({ min: 3, max: 20 }),
        (intent, count) => {
          // All events within window (spread 1 second apart)
          const events: QuestionEvent[] = Array.from({ length: count }, (_, i) =>
            makeEvent(intent, (i + 1) * 1000),
          )
          const result = checkRepeat(intent, events, NOW)
          return result.isRepeat === true && result.count === count
        },
      ),
      { numRuns: 200 },
    )
  })
})
