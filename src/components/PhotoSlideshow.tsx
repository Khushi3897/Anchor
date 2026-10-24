// src/components/PhotoSlideshow.tsx — full-screen calm photo slideshow
import { useState, useEffect } from 'react'
import type { PhotoCard } from '../lib/types'

interface PhotoSlideshowProps {
  cards: PhotoCard[]
  onClose: () => void
}

const ADVANCE_INTERVAL_MS = 7000  // 7 seconds (within 5–10 s requirement)

export function PhotoSlideshow({ cards, onClose }: PhotoSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (cards.length <= 1) return
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % cards.length)
    }, ADVANCE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [cards.length])

  return (
    <div className="slideshow-overlay" role="dialog" aria-modal="true" aria-label="Photo slideshow">
      <button className="slideshow-close" onClick={onClose}>
        Close
      </button>
      {cards.map((card, i) => (
        <div
          key={i}
          className={`slideshow-slide ${i === currentIndex ? 'slideshow-slide--active' : ''}`}
          aria-hidden={i !== currentIndex}
        >
          {imgError[i] ? (
            <div
              style={{
                background: '#333',
                borderRadius: 16,
                width: '80vw',
                height: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ) : (
            <img
              className="slideshow-image"
              src={card.imageUrl}
              alt={card.caption}
              onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
            />
          )}
          <p className="slideshow-caption">{card.caption}</p>
        </div>
      ))}
    </div>
  )
}
