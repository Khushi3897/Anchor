// src/components/CaregiverSetup.tsx
import { useState } from 'react'
import { ProfileEditor } from './ProfileEditor'
import { CaregiverDashboard } from './CaregiverDashboard'

type Tab = 'profile' | 'dashboard'

interface CaregiverSetupProps {
  onBack: () => void
}

export function CaregiverSetup({ onBack }: CaregiverSetupProps) {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="caregiver-setup">
      <div className="setup-header">
        <h1 className="setup-title">⚓ Anchor — Caregiver Setup</h1>
        <button className="btn-back" onClick={onBack}>
          ← Back to patient screen
        </button>
      </div>

      <div className="setup-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'profile'}
          className={`setup-tab ${tab === 'profile' ? 'setup-tab--active' : ''}`}
          onClick={() => setTab('profile')}
        >
          Life Profile
        </button>
        <button
          role="tab"
          aria-selected={tab === 'dashboard'}
          className={`setup-tab ${tab === 'dashboard' ? 'setup-tab--active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          Dashboard &amp; Alerts
        </button>
      </div>

      {tab === 'profile' && <ProfileEditor />}
      {tab === 'dashboard' && <CaregiverDashboard />}
    </div>
  )
}
