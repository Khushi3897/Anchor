// src/lib/storage.ts — localStorage read/write for Anchor
// All functions wrap calls in try/catch; reads return null/[] on failure; writes silently fail.

import type { LifeProfile, QuestionEvent, CaregiverAlert, QuestionIntent } from './types'

const KEYS = {
  profile: 'anchor:profile',
  events: 'anchor:events',
  alerts: 'anchor:alerts',
} as const

// ── Profile ──────────────────────────────────────────────────────────────────

export function loadProfile(): LifeProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.profile)
    if (!raw) return null
    return JSON.parse(raw) as LifeProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: LifeProfile): void {
  try {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile))
  } catch {
    // silently fail — never surface storage errors to the patient
  }
}

// ── Events ───────────────────────────────────────────────────────────────────

export function loadEvents(): QuestionEvent[] {
  try {
    const raw = localStorage.getItem(KEYS.events)
    if (!raw) return []
    return JSON.parse(raw) as QuestionEvent[]
  } catch {
    return []
  }
}

export function appendEvent(event: QuestionEvent): void {
  try {
    const events = loadEvents()
    events.push(event)
    localStorage.setItem(KEYS.events, JSON.stringify(events))
  } catch {
    // silently fail
  }
}

export function saveEvents(events: QuestionEvent[]): void {
  try {
    localStorage.setItem(KEYS.events, JSON.stringify(events))
  } catch {
    // silently fail
  }
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export function loadAlerts(): CaregiverAlert[] {
  try {
    const raw = localStorage.getItem(KEYS.alerts)
    if (!raw) return []
    return JSON.parse(raw) as CaregiverAlert[]
  } catch {
    return []
  }
}

export function appendAlert(alert: CaregiverAlert): void {
  try {
    const alerts = loadAlerts()
    alerts.unshift(alert) // newest first
    localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
  } catch {
    // silently fail
  }
}

export function saveAlerts(alerts: CaregiverAlert[]): void {
  try {
    localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
  } catch {
    // silently fail
  }
}

/** Mark an alert as handled by its id */
export function markAlertHandled(id: string): void {
  try {
    const alerts = loadAlerts()
    const updated = alerts.map((a) => (a.id === id ? { ...a, handled: true } : a))
    localStorage.setItem(KEYS.alerts, JSON.stringify(updated))
  } catch {
    // silently fail
  }
}

// ── Demo data seeding ─────────────────────────────────────────────────────────
// Generates realistic-looking question events and alerts spread across today.
// All data is fictional. Does NOT overwrite real events/alerts — merges in front.

export function seedDemoData(_caregiverName: string): void {
  try {
    const now = Date.now()
    const todayBase = new Date()
    todayBase.setHours(0, 0, 0, 0)
    const dayStart = todayBase.getTime()

    // Helper: timestamp at a given hour+minute today
    const ts = (h: number, m = 0) =>
      new Date(dayStart + h * 3_600_000 + m * 60_000).toISOString()

    // ── Question events (spread through the day) ────────────────────
    const demoIntents: Array<{ intent: QuestionIntent; timestamp: string; rawInput: string }> = [
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(7, 15), rawInput: 'What day is it?' },
      { intent: 'where-am-i'      as QuestionIntent, timestamp: ts(7, 40), rawInput: 'Where am I?' },
      { intent: 'who'             as QuestionIntent, timestamp: ts(8, 5),  rawInput: 'Who is here?' },
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(9, 0),  rawInput: 'What day is it?' },
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(9, 8),  rawInput: 'What day is it?' },
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(9, 14), rawInput: 'What day is it?' },
      { intent: 'where-caregiver' as QuestionIntent, timestamp: ts(10, 30), rawInput: 'Where is Rosie?' },
      { intent: 'feeling'         as QuestionIntent, timestamp: ts(11, 0),  rawInput: 'I feel confused' },
      { intent: 'who'             as QuestionIntent, timestamp: ts(11, 45), rawInput: '' },
      { intent: 'where-am-i'      as QuestionIntent, timestamp: ts(13, 20), rawInput: '' },
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(14, 5),  rawInput: 'What is today?' },
      { intent: 'person'          as QuestionIntent, timestamp: ts(14, 50), rawInput: 'Where is Rosie?' },
      { intent: 'where-caregiver' as QuestionIntent, timestamp: ts(15, 30), rawInput: '' },
      { intent: 'who'             as QuestionIntent, timestamp: ts(16, 10), rawInput: '' },
      { intent: 'what-day'        as QuestionIntent, timestamp: ts(16, 55), rawInput: '' },
      { intent: 'unknown'         as QuestionIntent, timestamp: ts(17, 20), rawInput: 'What is for dinner?' },
      { intent: 'where-am-i'      as QuestionIntent, timestamp: ts(18, 0),  rawInput: '' },
      { intent: 'who'             as QuestionIntent, timestamp: ts(19, 10), rawInput: '' },
    ]
    const demoEvents: QuestionEvent[] = demoIntents.filter(
      (e) => new Date(e.timestamp).getTime() <= now,
    ) // don't add future events

    // Merge with any existing events (real first, demo appended)
    const existing = loadEvents()
    // Avoid duplicating seed events if "Load demo" is clicked twice
    const existingRaw = new Set(existing.map((e) => e.timestamp))
    const fresh = demoEvents.filter((e) => !existingRaw.has(e.timestamp))
    saveEvents([...existing, ...fresh])

    // ── Caregiver alerts ────────────────────────────────────────────
    const demoAlerts: CaregiverAlert[] = ([
      {
        id: 'demo-urgent-1',
        severity: 'urgent',
        message: `Safety escalation triggered by: "i fell"`,
        timestamp: ts(8, 52),
        handled: false,
        triggerPhrase: 'i fell',
      },
      {
        id: 'demo-checkin-1',
        severity: 'check-in',
        message: `"what-day" asked 4 times in 10 minutes — may signal worry or an unmet need (hunger, thirst, bathroom, pain, tiredness, loneliness, noise, or temperature).`,
        timestamp: ts(9, 14),
        handled: false,
        intent: 'what-day',
        repeatCount: 4,
        windowStart: ts(9, 0),
      },
      {
        id: 'demo-checkin-2',
        severity: 'check-in',
        message: `Painful topic detected in: "I want to go home" — no gentle response configured.`,
        timestamp: ts(11, 32),
        handled: true,
        intent: 'unknown',
        triggerPhrase: 'I want to go home',
      },
      {
        id: 'demo-missing-1',
        severity: 'missing-info',
        message: `Unrecognised question: "What is for dinner?"`,
        timestamp: ts(17, 20),
        handled: false,
        intent: 'unknown',
        triggerPhrase: 'What is for dinner?',
      },
      {
        id: 'demo-checkin-3',
        severity: 'check-in',
        message: `"who" asked 3 times in 10 minutes — may signal worry or an unmet need.`,
        timestamp: ts(19, 12),
        handled: false,
        intent: 'who',
        repeatCount: 3,
        windowStart: ts(18, 55),
      },
    ] as CaregiverAlert[]).filter((a) => new Date(a.timestamp).getTime() <= now)

    // Merge: real alerts (newest first) + demo alerts that aren't already present
    const existingAlerts = loadAlerts()
    const existingIds = new Set(existingAlerts.map((a) => a.id))
    const freshAlerts = demoAlerts.filter((a) => !existingIds.has(a.id))
    // Insert demo alerts in chronological position (newest-first list)
    const merged = [...existingAlerts, ...freshAlerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    saveAlerts(merged)
  } catch {
    // silently fail
  }
}
