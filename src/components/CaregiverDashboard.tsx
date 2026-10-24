// src/components/CaregiverDashboard.tsx
import { AlertList } from './AlertList'
import { UnmetNeedChecklist } from './UnmetNeedChecklist'
import { loadEvents } from '../lib/storage'
import type { QuestionIntent } from '../lib/types'

const INTENTS: QuestionIntent[] = ['who', 'where-am-i', 'what-day', 'where-caregiver']
const INTENT_LABELS: Record<QuestionIntent, string> = {
  'who': 'Who is here?',
  'where-am-i': 'Where am I?',
  'what-day': 'What day is it?',
  'where-caregiver': 'Where is caregiver?',
  'unknown': 'Other',
}

function getTodayStart(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function CaregiverDashboard() {
  const events = loadEvents()
  const todayStart = getTodayStart()
  const todayEvents = events.filter((e) => new Date(e.timestamp).getTime() >= todayStart)

  // Count by intent (today)
  const counts: Record<QuestionIntent, number> = {
    'who': 0, 'where-am-i': 0, 'what-day': 0, 'where-caregiver': 0, 'unknown': 0,
  }
  for (const e of todayEvents) counts[e.intent] = (counts[e.intent] ?? 0) + 1

  // Hour-of-day frequency (all time)
  const hourly = new Array<number>(24).fill(0)
  for (const e of events) {
    const h = new Date(e.timestamp).getHours()
    hourly[h]++
  }
  const maxHour = Math.max(...hourly, 1)

  return (
    <div>
      <AlertList />

      <div className="dashboard-section">
        <h2>Questions today</h2>
        <div className="count-grid">
          {INTENTS.map((intent) => (
            <div key={intent} className="count-cell">
              <div className="count-number">{counts[intent]}</div>
              <div style={{ fontSize: 20 }}>{INTENT_LABELS[intent]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Question frequency by hour</h2>
        <div className="hour-chart" aria-label="Hourly question frequency">
          {hourly.map((count, h) => (
            <div
              key={h}
              className="hour-bar"
              style={{ height: `${Math.round((count / maxHour) * 100)}%` }}
              title={`${h}:00 — ${count} question${count !== 1 ? 's' : ''}`}
              aria-label={`${h}:00, ${count} questions`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'var(--color-text-muted)' }}>
          <span>Midnight</span><span>Noon</span><span>11 pm</span>
        </div>
      </div>

      <UnmetNeedChecklist />
    </div>
  )
}
