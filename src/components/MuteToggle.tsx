// src/components/MuteToggle.tsx
interface MuteToggleProps {
  muted: boolean
  onToggle: () => void
}

export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      className="mute-toggle"
      aria-pressed={muted}
      aria-label={muted ? 'Unmute voice' : 'Mute voice'}
      onClick={onToggle}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
