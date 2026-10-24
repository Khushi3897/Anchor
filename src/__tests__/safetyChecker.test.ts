// Feature: anchor-app
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { checkSafety } from '../lib/safetyChecker'

// ── Unit tests (Requirement 18.1) ────────────────────────────────────────────

describe('Safety Checker — pain expressions', () => {
  it('detects "pain"', () => {
    expect(checkSafety('I am in pain').escalation).toBe(true)
  })
  it('detects "hurt"', () => {
    expect(checkSafety('My arm hurts').escalation).toBe(true)
  })
  it('detects "ache"', () => {
    expect(checkSafety('I have an ache in my knee').escalation).toBe(true)
  })
})

describe('Safety Checker — fall reports', () => {
  it('detects "fell"', () => {
    expect(checkSafety('I fell down').escalation).toBe(true)
  })
  it('detects "fall"', () => {
    expect(checkSafety('I had a fall').escalation).toBe(true)
  })
  it('detects "slipped"', () => {
    expect(checkSafety('I slipped on the floor').escalation).toBe(true)
  })
})

describe('Safety Checker — self-harm statements', () => {
  it('detects "hurt myself"', () => {
    expect(checkSafety('I want to hurt myself').escalation).toBe(true)
  })
  it('detects "kill myself"', () => {
    expect(checkSafety('I want to kill myself').escalation).toBe(true)
  })
  it('detects "want to die"', () => {
    expect(checkSafety('I want to die').escalation).toBe(true)
  })
})

describe('Safety Checker — leave alone phrases', () => {
  it('detects "leave alone"', () => {
    expect(checkSafety('I want to leave alone').escalation).toBe(true)
  })
  it('detects "go alone"', () => {
    expect(checkSafety('I need to go alone').escalation).toBe(true)
  })
})

describe('Safety Checker — clean input (negative cases)', () => {
  it('does not escalate for a normal question', () => {
    expect(checkSafety('What day is it?').escalation).toBe(false)
  })
  it('does not escalate for empty string', () => {
    expect(checkSafety('').escalation).toBe(false)
  })
  it('does not escalate for casual greeting', () => {
    expect(checkSafety('Hello, who is here?').escalation).toBe(false)
  })
})

// ── Property 6: Safety escalation is case-insensitive (Requirement 13.4) ─────
// Feature: anchor-app, Property 6: Safety escalation is case-insensitive

const KNOWN_KEYWORDS = [
  'pain', 'hurt', 'fell', 'fall', 'bleeding', 'unsafe',
  'leave alone', 'harm myself', 'kill myself', 'want to die',
]

describe('Property 6 — Safety Checker is case-insensitive', () => {
  it('escalates for any capitalisation variant of a known keyword', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_KEYWORDS),
        fc.array(fc.boolean(), { minLength: 20, maxLength: 20 }),
        (keyword, upperFlags) => {
          const variant = keyword
            .split('')
            .map((ch, i) => (upperFlags[i % upperFlags.length] ? ch.toUpperCase() : ch.toLowerCase()))
            .join('')
          const result = checkSafety(variant)
          return result.escalation === true
        },
      ),
      { numRuns: 200 },
    )
  })
})
