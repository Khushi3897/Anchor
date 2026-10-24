// src/components/PhotoSlideshow.tsx — full-screen slideshow with tap/swipe navigation
import { useState, useEffect, useRef, useCallback } from 'react'
import type { PhotoCard } from '../lib/types'

interface PhotoSlideshowProps {
  cards: PhotoCard[]
  onClose: () => void
}

const AUTO_ADVANCE_MS = 7000

export function PhotoSlideshow({ cards, onClose }: PhotoSlideshowProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((delta: 1 | -1) => {
    setDirection(delta === 1 ? 'next' : 'prev')
    setAnimKey(k => k + 1)
    setIndex(i => (i + delta + cards.length) % cards.length)
    setPaused(true)
    // Resume auto-advance after 12 s of inactivity
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDirection('next')
      setAnimKey(k => k + 1)
      setIndex(i => (i + 1) % cards.length)
    }, AUTO_ADVANCE_MS)
  }, [cards.length])

  // Auto-advance
  useEffect(() => {
    if (cards.length <= 1) return
    timerRef.current = setInterval(() => {
      setDirection('next')
      setAnimKey(k => k + 1)
      setIndex(i => (i + 1) % cards.length)
    }, AUTO_ADVANCE_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [cards.length])

  // Touch swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, onClose])

  const card = cards[index]

  return (
    <div
      className="slideshow-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Photo slideshow"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-bleed background blur from current image */}
      {!imgError[index] && (
        <div
          className="slideshow-bg-blur"
          style={{ backgroundImage: `url(${card.imageUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <div className="slideshow-main" key={animKey} data-dir={direction}>
        {imgError[index] ? (
          <div className="slideshow-placeholder">
            <span>📷</span>
          </div>
        ) : (
          <img
            className="slideshow-image"
            src={card.imageUrl}
            alt={card.caption}
            onError={() => setImgError(p => ({ ...p, [index]: true }))}
          />
        )}
      </div>

      {/* Caption */}
      <div className="slideshow-caption-bar">
        <p className="slideshow-caption">{card.caption}</p>
        <p className="slideshow-counter">{index + 1} / {cards.length}</p>
      </div>

      {/* Dot indicators */}
      {cards.length > 1 && (
        <div className="slideshow-dots" aria-label="Photo navigation">
          {cards.map((_, i) => (
            <button
              key={i}
              className={`slideshow-dot ${i === index ? 'slideshow-dot--active' : ''}`}
              onClick={() => go(i > index ? 1 : -1)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {cards.length > 1 && (
        <>
          <button className="slideshow-arrow slideshow-arrow--prev" onClick={() => go(-1)} aria-label="Previous photo">
            ‹
          </button>
          <button className="slideshow-arrow slideshow-arrow--next" onClick={() => go(1)} aria-label="Next photo">
            ›
          </button>
        </>
      )}

      {/* Close — rendered last, highest z-index */}
      <button className="slideshow-close" onClick={onClose} aria-label="Close photo slideshow">
        ✕ Close
      </button>

      {/* Pause indicator */}
      {paused && cards.length > 1 && (
        <span className="slideshow-paused-badge" aria-live="polite">Paused</span>
      )}
    </div>
  )
}
