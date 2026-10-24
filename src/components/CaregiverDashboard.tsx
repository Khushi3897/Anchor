// src/components/CaregiverDashboard.tsx
import { useState } from 'react'
import { AlertList } from './AlertList'
import { UnmetNeedChecklist } from './UnmetNeedChecklist'
import { loadEvents, loadAlerts, saveAlerts } from '../lib/storage'
import type { QuestionIntent } from '../lib/types'

interface IntentConfig { intent: QuestionIntent; label: string; icon: string }

const INTENT_CONFIGS: IntentConfig[] = [
  { intent: 'who',             label: 'Who is here?',        icon: '👥' },
  { intent: 'where-am-i',      label: 'Where am I?',         icon: '🏠' },
  { intent: 'what-day',        label: 'What day?',           icon: '📅' },
  { intent: 'where-caregiver', label: 'Where is caregiver?', icon: '💛' },
  { intent: 'feeling',         label: 'Feelings',            icon: '💬' },
  { intent: 'person',          label: 'About a person',      icon: '🙂' },
  { intent: 'unknown',         label: 'Other',               icon: '❓' },
]

function getTodayStart() {
  const d = new Date(); d.setHours(0,0,0,0); return d.getTime()
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, count, highlight }: { icon: string; label: string; count: number; highlight?: boolean }) {
  return (
    <div className={`stat-card ${highlight ? 'stat-card--highlight' : ''}`}>
      <span className="stat-card__icon">{icon}</span>
      <span className="stat-card__count">{count}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}

// ── Insight chips ────────────────────────────────────────────────────────────
function InsightChips({ counts, total, urgentCount }: {
  counts: Record<QuestionIntent, number>
  total: number
  urgentCount: number
}) {
  const topIntent = INTENT_CONFIGS.filter(c => c.intent !== 'unknown')
    .sort((a, b) => counts[b.intent] - counts[a.intent])[0]

  return (
    <div className="insight-chips">
      <div className="insight-chip insight-chip--blue">
        📊 {total} question{total !== 1 ? 's' : ''} today
      </div>
      {urgentCount > 0 && (
        <div className="insight-chip insight-chip--red">
          🚨 {urgentCount} urgent alert{urgentCount !== 1 ? 's' : ''}
        </div>
      )}
      {total > 0 && topIntent && counts[topIntent.intent] > 0 && (
        <div className="insight-chip insight-chip--green">
          {topIntent.icon} Most asked: {topIntent.label}
        </div>
      )}
    </div>
  )
}

// ── Bar chart ────────────────────────────────────────────────────────────────
function TodayBarChart({ hourly }: { hourly: number[] }) {
  const max = Math.max(...hourly, 1)
  const CHART_H = 100
  const BAR_W   = 11
  const GAP     = 3
  const LABEL_H = 18
  const W       = hourly.length * (BAR_W + GAP)
  const nowH    = new Date().getHours()

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${CHART_H + LABEL_H}`}
      aria-label="Questions by hour today"
      role="img"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <title>Questions by hour today</title>
      {hourly.map((count, h) => {
        const barH = Math.max(count > 0 ? Math.round((count / max) * CHART_H) : 0, count > 0 ? 4 : 0)
        const x = h * (BAR_W + GAP)
        const isNow = h === nowH
        return (
          <g key={h}>
            <rect
              x={x} y={CHART_H - barH}
              width={BAR_W} height={barH || 3}
              rx={3}
              fill={isNow ? '#3D7A5C' : count > 0 ? '#2C5282' : '#D8D0C4'}
              opacity={count > 0 ? 0.9 : 0.4}
            >
              <title>{h}:00 — {count} question{count !== 1 ? 's' : ''}</title>
            </rect>
            {h % 4 === 0 && (
              <text
                x={x + BAR_W / 2} y={CHART_H + LABEL_H - 2}
                textAnchor="middle" fontSize={9} fill="#6B6B8A" fontFamily="Nunito, sans-serif"
              >
                {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h-12}p`}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function CaregiverDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const events = loadEvents()
  const alerts = loadAlerts()
  const todayStart = getTodayStart()
  const todayEvents = events.filter(e => new Date(e.timestamp).getTime() >= todayStart)

  const counts: Record<QuestionIntent, number> = {
    'who': 0, 'where-am-i': 0, 'what-day': 0, 'where-caregiver': 0,
    'feeling': 0, 'person': 0, 'unknown': 0,
  }
  for (const e of todayEvents) counts[e.intent] = (counts[e.intent] ?? 0) + 1

  const hourly = new Array<number>(24).fill(0)
  for (const e of todayEvents) hourly[new Date(e.timestamp).getHours()]++

  const totalToday = todayEvents.length
  const peakH = hourly.indexOf(Math.max(...hourly))
  const urgentCount = alerts.filter(a => a.severity === 'urgent' && !a.handled).length

  const peakLabel = peakH === 0 ? '12 am'
    : peakH < 12 ? `${peakH} am`
    : peakH === 12 ? '12 pm'
    : `${peakH - 12} pm`

  function clearHandled() {
    const remaining = alerts.filter(a => !a.handled)
    saveAlerts(remaining)
    setRefreshKey(k => k + 1)
  }

  // Find the most-repeated intent today
  const topIntent = INTENT_CONFIGS
    .map(c => ({ ...c, n: counts[c.intent] }))
    .sort((a, b) => b.n - a.n)[0]

  return (
    <div key={refreshKey}>

      {/* ── Insight chips ── */}
      <InsightChips counts={counts} total={totalToday} urgentCount={urgentCount} />

      {/* ── Alerts ── */}
      <div className="dashboard-section-header">
        <h2>Alerts</h2>
        {alerts.some(a => a.handled) && (
          <button className="btn btn--ghost btn--small" onClick={clearHandled}>
            🗑 Clear handled
          </button>
        )}
      </div>
      <AlertList key={refreshKey} />

      {/* ── Question counts ── */}
      <div className="dashboard-section">
        <h2>Questions today</h2>
        <div className="stat-grid">
          {INTENT_CONFIGS.map(({ intent, label, icon }) => (
            <StatCard
              key={intent}
              icon={icon}
              label={label}
              count={counts[intent]}
              highlight={topIntent?.intent === intent && counts[intent] > 0}
            />
          ))}
        </div>
      </div>

      {/* ── Time-of-day chart ── */}
      <div className="dashboard-section">
        <h2>Activity by hour</h2>
        <div className="chart-wrap">
          <TodayBarChart hourly={hourly} />
        </div>
        <p className="chart-summary">
          {totalToday === 0
            ? 'No questions yet today'
            : `${totalToday} question${totalToday !== 1 ? 's' : ''} today · busiest around ${peakLabel}`}
        </p>
      </div>

      {/* ── Unmet needs ── */}
      <UnmetNeedChecklist />
    </div>
  )
}
