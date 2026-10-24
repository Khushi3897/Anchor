// src/components/BreathingExercise.tsx — calm guided breathing circle.
// Slow 4s in / 4s hold / 4s out cycle. No flashing, no sudden motion.
import { useState, useEffect, useRef } from 'react'
import { speak, cancelSpeech } from '../lib/speech'

interface BreathingExerciseProps {
  muted: boolean
  onClose: () => void
}

type Phase = 'in' | 'hold' | 'out'

const PHASES: { phase: Phase; label: string; seconds: number }[] = [
  { phase: 'in',   label: 'Breathe in…',  seconds: 4 },
  { phase: 'hold', label: 'Hold…',        seconds: 4 },
  { phase: 'out',  label: 'Breathe out…', seconds: 4 },
]

export function BreathingExercise({ muted, onClose }: BreathingExerciseProps) {
  const [step, setStep] = useState(0)
  const spokenRef = useRef<number | null>(null)

  const current = PHASES[step]

  useEffect(() => {
    // Speak the guidance once per phase change
    if (!muted && spokenRef.current !== step) {
      spokenRef.current = step
      speak(current.label, muted)
    }
    const id = setTimeout(() => {
      setStep((s) => (s + 1) % PHASES.length)
    }, current.seconds * 1000)
    return () => clearTimeout(id)
  }, [step, current.label, current.seconds, muted])

  useEffect(() => () => cancelSpeech(), [])

  return (
    <div className="breathing-overlay" role="dialog" aria-modal="true" aria-label="Breathing exercise">
      <div className="breathing-content">
        <div className={`breathing-circle breathing-circle--${current.phase}`}>
          <span className="breathing-label">{current.label}</span>
        </div>
        <p className="breathing-hint">Follow the circle. Let's breathe together.</p>
        <button
          className="btn btn--secondary"
          onClick={() => { cancelSpeech(); onClose() }}
        >
          ✓ I feel better
        </button>
      </div>
    </div>
  )
}
