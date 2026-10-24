// src/components/UnmetNeedChecklist.tsx
import { useState } from 'react'

const NEEDS = [
  { id: 'hungry',     label: '🍽️ Hungry' },
  { id: 'thirsty',    label: '💧 Thirsty' },
  { id: 'bathroom',   label: '🚽 Bathroom' },
  { id: 'pain',       label: '💊 Pain' },
  { id: 'tired',      label: '😴 Tired' },
  { id: 'lonely',     label: '🤝 Lonely' },
  { id: 'noisy',      label: '🔊 Noisy' },
  { id: 'temperature',label: '🌡️ Too hot/cold' },
]

export function UnmetNeedChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="dashboard-section">
      <h2>Unmet need?</h2>
      <div className="unmet-grid">
        {NEEDS.map(({ id, label }) => (
          <label key={id} className="unmet-item">
            <input
              type="checkbox"
              className="unmet-checkbox"
              checked={!!checked[id]}
              onChange={() => toggle(id)}
              aria-label={label}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
