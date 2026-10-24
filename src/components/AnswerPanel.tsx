// src/components/AnswerPanel.tsx
import { useState } from 'react'
import type { VisualTheme } from '../lib/answerFunction'

interface AnswerPanelProps {
  answer: string
  photoUrl?: string
  visualIcon?: string
  visualTheme?: VisualTheme
  muted: boolean
  onReplay: () => void
  onLookAtPhotos?: () => void
  onClose: () => void
}

export function AnswerPanel({
  answer,
  photoUrl,
  visualIcon,
  visualTheme = 'safe',
  muted: _muted,
  onReplay,
  onLookAtPhotos,
  onClose,
}: AnswerPanelProps) {
  const [imgError, setImgError] = useState(false)
  const showPhoto = photoUrl && !imgError

  return (
    <div className="answer-overlay" role="dialog" aria-modal="true" aria-label="Answer">
      <div className="answer-panel">
        {/* Visual: real photo if available, otherwise a themed glowing icon */}
        <div className={`answer-visual answer-visual--${visualTheme}`}>
          {showPhoto ? (
            <img
              className="answer-photo"
              src={photoUrl}
              alt="Person"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="answer-visual__icon" aria-hidden="true">
              {visualIcon ?? '🛟'}
            </span>
          )}
        </div>

        <p className="answer-text">{answer}</p>

        <div className="answer-actions">
          <button className="answer-btn answer-btn--replay" onClick={onReplay}>
            🔁 Replay
          </button>
          {onLookAtPhotos && (
            <button className="answer-btn answer-btn--photos" onClick={onLookAtPhotos}>
              📷 Look at photos
            </button>
          )}
          <button className="answer-btn answer-btn--close" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  )
}
