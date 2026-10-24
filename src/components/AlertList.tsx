// src/components/AlertList.tsx
import { loadAlerts } from '../lib/storage'

export function AlertList() {
  const alerts = loadAlerts()
  const urgent = alerts.filter((a) => a.severity === 'urgent')
  const checkIn = alerts.filter((a) => a.severity === 'check-in')
  const sorted = [...urgent, ...checkIn]

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
          className={`alert-item alert-item--${alert.severity}`}
        >
          <strong>{alert.severity === 'urgent' ? '🚨 Urgent' : 'ℹ️ Check-in'}</strong>
          {' — '}
          {alert.message}
          {alert.triggerPhrase && (
            <span style={{ fontSize: 20 }}> (trigger: "{alert.triggerPhrase}")</span>
          )}
          <div className="alert-timestamp">
            {new Date(alert.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
