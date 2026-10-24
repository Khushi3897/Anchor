// src/lib/storage.ts — localStorage read/write for Anchor
// All functions wrap calls in try/catch; reads return null/[] on failure; writes silently fail.

import type { LifeProfile, QuestionEvent, CaregiverAlert } from './types'

const KEYS = {
  profile: 'anchor:profile',
  events: 'anchor:events',
  alerts: 'anchor:alerts',
} as const

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
    // newest first
    alerts.unshift(alert)
    localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
  } catch {
    // silently fail
  }
}
