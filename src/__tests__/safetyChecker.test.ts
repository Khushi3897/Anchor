// Feature: anchor-app
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { checkSafety, SAFETY_KEYWORDS } from '../lib/safetyChecker'

// ── Unit tests (Requirement 18.1) ────────────────────────────────────────────

describe('Safety Checker — pain expressions', () => {
  it('detects "in pain"', () => {
    expect(checkSafety('I am in pain').escalation).toBe(true)
  })
  it('detects "hurts"', () => {
    expect(checkSafety('My arm hurts').escalation).toBe(true)
  })
  it('detects "sore"', () => {
    expect(checkSafety('My foot is sore').escalation).toBe(true)
  })
})

describe('Safety Checker — fall reports', () => {
  it('detects "i fell"', () => {
    expect(checkSafety('I fell down').escalation).toBe(true)
  })
  it('detects "slipped"', () => {
    expect(checkSafety('I slipped on the floor').escalation).toBe(true)
  })
  it('detects "tripped"', () => {
    expect(checkSafety('I tripped on the rug').escalation).toBe(true)
  })
})

describe('Safety Checker — chest / breathing', () => {
  it('detects standalone "chest"', () => {
    expect(checkSafety('My chest').escalation).toBe(true)
  })
  it('detects "chest pain"', () => {
    expect(checkSafety('I have chest pain').escalation).toBe(true)
  })
  it('detects "can\'t breathe"', () => {
    expect(checkSafety("I can't breathe").escalation).toBe(true)
  })
  it('detects "short of breath"', () => {
    expect(checkSafety('I am short of breath').escalation).toBe(true)
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
  it('detects "not worth living"', () => {
    expect(checkSafety('Life is not worth living').escalation).toBe(true)
  })
})

describe('Safety Checker — scared / someone hurting', () => {
  it('detects "scared"', () => {
    expect(checkSafety('I am so scared').escalation).toBe(true)
  })
  it('detects "someone hurt me"', () => {
    expect(checkSafety('Someone hurt me').escalation).toBe(true)
  })
})

describe('Safety Checker — leave alone phrases', () => {
  it('detects "leave alone"', () => {
    expect(checkSafety('I want to leave alone').escalation).toBe(true)
  })
  it('detects "go home alone" (NOT plain go home)', () => {
    expect(checkSafety('I want to go home alone').escalation).toBe(true)
  })
  it('does NOT escalate for plain "go home" (gentle-response topic)', () => {
    expect(checkSafety('I want to go home').escalation).toBe(false)
  })
  it('does NOT escalate for "want to go home" (gentle-response topic)', () => {
    expect(checkSafety('I want to go home').escalation).toBe(false)
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
  it('does not escalate for "go home" (painful topic, not safety)', () => {
    expect(checkSafety('I want to go home').escalation).toBe(false)
  })
})

// ── Property 6: Safety escalation is case-insensitive (Requirement 13.4) ─────
// Feature: anchor-app, Property 6: Safety escalation is case-insensitive

// Use a subset of keywords that are purely alphabetic so case-flipping is unambiguous
const CASE_TEST_KEYWORDS = SAFETY_KEYWORDS.filter((kw) => /^[a-z ]+$/.test(kw)).slice(0, 15)

describe('Property 6 — Safety Checker is case-insensitive', () => {
  it('escalates for any capitalisation variant of a known keyword', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CASE_TEST_KEYWORDS),
        fc.array(fc.boolean(), { minLength: 30, maxLength: 30 }),
        (keyword, upperFlags) => {
          const variant = keyword
            .split('')
            .map((ch, i) => (upperFlags[i % upperFlags.length] ? ch.toUpperCase() : ch.toLowerCase()))
            .join('')
          return checkSafety(variant).escalation === true
        },
      ),
      { numRuns: 200 },
    )
  })
})
