// src/components/UnmetNeedChecklist.tsx
import { useState } from 'react'

const NEEDS = [
  { id: 'hungry',      label: '🍽️  Hungry' },
  { id: 'thirsty',     label: '💧  Thirsty' },
  { id: 'bathroom',    label: '🚽  Bathroom' },
  { id: 'pain',        label: '💊  Pain' },
  { id: 'tired',       label: '😴  Tired' },
  { id: 'lonely',      label: '🤝  Lonely' },
  { id: 'noisy',       label: '🔊  Too noisy' },
  { id: 'temperature', label: '🌡️  Too hot/cold' },
]

interface UnmetNeedChecklistProps {
  /** When true the checklist starts open. Used when shown inside a check-in alert. */
  defaultExpanded?: boolean
  /** Compact variant strips the section heading and outer padding */
  compact?: boolean
}

export function UnmetNeedChecklist({ defaultExpanded = false, compact = false }: UnmetNeedChecklistProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className={compact ? 'unmet-checklist--compact' : 'dashboard-section'}>
      {!compact && (
        <button
          className="unmet-toggle-btn"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          <span>Might be an unmet need?</span>
          {checkedCount > 0 && (
            <span className="unmet-badge">{checkedCount} checked</span>
          )}
          <span className="unmet-chevron" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
        </button>
      )}

      {(expanded || compact) && (
        <div className="unmet-grid" style={compact ? { marginTop: 8 } : {}}>
          {NEEDS.map(({ id, label }) => (
            <label key={id} className="unmet-item">
              <input
                type="checkbox"
                className="unmet-checkbox"
                checked={!!checked[id]}
                onChange={() => toggle(id)}
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
