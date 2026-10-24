// src/components/AnswerPanel.tsx
import { useState } from 'react'

interface AnswerPanelProps {
  answer: string
  photoUrl?: string
  muted: boolean
  onReplay: () => void
  onLookAtPhotos?: () => void  // only shown when photo cards exist
  onClose: () => void
}

export function AnswerPanel({
  answer,
  photoUrl,
  muted: _muted,
  onReplay,
  onLookAtPhotos,
  onClose,
}: AnswerPanelProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="answer-overlay" role="dialog" aria-modal="true" aria-label="Answer">
      <div className="answer-panel">
        {photoUrl && !imgError && (
          <img
            className="answer-photo"
            src={photoUrl}
            alt="Person"
            onError={() => setImgError(true)}
          />
        )}
        <p className="answer-text">{answer}</p>
        <div className="answer-actions">
          <button className="answer-btn answer-btn--replay" onClick={onReplay}>
            🔁 Replay
          </button>
          {onLookAtPhotos && (
            <button className="answer-btn answer-btn--photos" onClick={onLookAtPhotos}>
              📷 Look at photos?
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
