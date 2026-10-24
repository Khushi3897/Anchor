// src/components/AlertList.tsx
import { useState } from 'react'
import { loadAlerts, markAlertHandled } from '../lib/storage'
import { UnmetNeedChecklist } from './UnmetNeedChecklist'
import type { CaregiverAlert } from '../lib/types'

function severityLabel(a: CaregiverAlert): string {
  if (a.severity === 'urgent')       return '🚨 Urgent'
  if (a.severity === 'missing-info') return '📋 Missing info'
  return 'ℹ️ Check-in'
}

function severityClass(a: CaregiverAlert): string {
  if (a.severity === 'urgent')       return 'alert-item--urgent'
  if (a.severity === 'missing-info') return 'alert-item--missing'
  return 'alert-item--check-in'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AlertList() {
  const [alerts, setAlerts] = useState<CaregiverAlert[]>(() => loadAlerts())

  const urgent  = alerts.filter((a) => a.severity === 'urgent')
  const checkin = alerts.filter((a) => a.severity === 'check-in')
  const missing = alerts.filter((a) => a.severity === 'missing-info')
  const sorted  = [...urgent, ...checkin, ...missing]

  function handleMarkHandled(id: string) {
    markAlertHandled(id)
    setAlerts(loadAlerts())
  }

  return (
    <div className="dashboard-section">
      <h2>Alerts</h2>

      {urgent.length > 0 && (
        <div className="alert-911" role="alert">
          ⚠️ If someone may be in danger, call 911.
        </div>
      )}

      {sorted.length === 0 && (
        <p style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>No alerts yet.</p>
      )}

      {sorted.map((alert) => (
        <div
          key={alert.id}
          className={[
            'alert-item',
            severityClass(alert),
            alert.handled ? 'alert-item--handled' : '',
          ].join(' ')}
        >
          {/* ── Header row ── */}
          <div className="alert-item__header">
            <div className="alert-item__meta">
              <span className="alert-item__badge">{severityLabel(alert)}</span>
              <span className="alert-item__msg">{alert.message}</span>
              {alert.triggerPhrase && (
                <span className="alert-item__trigger">
                  trigger: &ldquo;{alert.triggerPhrase}&rdquo;
                </span>
              )}
              {alert.repeatCount !== undefined && (
                <span className="alert-item__trigger">asked {alert.repeatCount}×</span>
              )}
            </div>

            <div className="alert-item__actions">
              <span className="alert-timestamp">
                {formatTime(alert.timestamp)}
                {alert.handled && <span className="alert-handled-tag">✓ Handled</span>}
              </span>
              {!alert.handled && (
                <button
                  className="btn btn--small btn--secondary"
                  onClick={() => handleMarkHandled(alert.id)}
                >
                  Mark handled
                </button>
              )}
            </div>
          </div>

          {/* ── Inline unmet-needs checklist, auto-expanded for check-in alerts ── */}
          {alert.severity === 'check-in' && !alert.handled && (
            <UnmetNeedChecklist defaultExpanded compact />
          )}
        </div>
      ))}
    </div>
  )
}
