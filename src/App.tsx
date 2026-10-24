// src/App.tsx — root component with error boundary
import { useState, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { PatientScreen } from './components/PatientScreen'
import { CaregiverSetup } from './components/CaregiverSetup'
import { loadProfile } from './lib/storage'

type AppMode = 'patient' | 'caregiver'

// Error boundary — wraps PatientScreen so errors never reach the patient as a crash
interface EBState { hasError: boolean }
interface EBProps { children: ReactNode }

class PatientErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): EBState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never log profile contents; only log the error structure
    console.error('[Anchor] PatientScreen error:', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const caregiverName = (() => {
        try { return loadProfile()?.primaryCaregiver?.name ?? null } catch { return null }
      })()
      const msg = caregiverName
        ? `I'm here. I'll get ${caregiverName}.`
        : "I'm here. I'll get your caregiver."

      return (
        <div className="error-fallback" role="alert">
          <p>{msg}</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('patient')

  return mode === 'patient' ? (
    <PatientErrorBoundary>
      <PatientScreen onEnterCaregiver={() => setMode('caregiver')} />
    </PatientErrorBoundary>
  ) : (
    <CaregiverSetup onBack={() => setMode('patient')} />
  )
}
