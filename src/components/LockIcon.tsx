// src/components/LockIcon.tsx — 2-second hold to enter Caregiver mode
import { useRef } from 'react'

interface LockIconProps {
  onEnterCaregiver: () => void
}

export function LockIcon({ onEnterCaregiver }: LockIconProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => {
      onEnterCaregiver()
    }, 2000)
  }

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <button
      className="lock-icon"
      aria-label="Caregiver access (hold for 2 seconds)"
      onPointerDown={handlePointerDown}
      onPointerUp={cancelTimer}
      onPointerLeave={cancelTimer}
    >
      🔒
    </button>
  )
}
