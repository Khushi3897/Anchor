// src/components/PatientScreen.tsx
import { useState, useEffect } from 'react'
import { LockIcon } from './LockIcon'
import { MuteToggle } from './MuteToggle'
import { QuestionButtons } from './QuestionButtons'
import { AskAnchorInput } from './AskAnchorInput'
import { AnswerPanel } from './AnswerPanel'
import { PhotoSlideshow } from './PhotoSlideshow'
import { BreathingExercise } from './BreathingExercise'
import { checkSafety } from '../lib/safetyChecker'
import { matchIntent } from '../lib/intentMatcher'
import { checkRepeat } from '../lib/repeatDetector'
import { buildAnswer } from '../lib/answerFunction'
import { speak, cancelSpeech } from '../lib/speech'
import { tapFeedback } from '../lib/haptics'
import { loadProfile, loadEvents, appendEvent, appendAlert } from '../lib/storage'
import type { QuestionIntent } from '../lib/types'

interface PatientScreenProps {
  onEnterCaregiver: () => void
}

interface ActiveAnswer {
  text: string
  photoUrl?: string
  offerSlideshow: boolean
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function PatientScreen({ onEnterCaregiver }: PatientScreenProps) {
  const [muted, setMuted] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<ActiveAnswer | null>(null)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const now = useClock()

  const profile = loadProfile()
  const caregiverName = profile?.primaryCaregiver?.name
  const patientName = profile?.patientName
  const photoCards = profile?.photoCards ?? []
  const fallbackName = caregiverName ?? 'your caregiver'

  function logRepeatIfNeeded(intent: QuestionIntent) {
    const events = loadEvents()
    const repeatResult = checkRepeat(intent, events)
    if (repeatResult.isRepeat) {
      appendAlert({
        id: crypto.randomUUID(),
        severity: 'check-in',
        message: `"${intent}" asked ${repeatResult.count} times in 10 minutes — may signal worry or an unmet need.`,
        timestamp: new Date().toISOString(),
        handled: false,
        intent,
        repeatCount: repeatResult.count,
        windowStart: repeatResult.windowStart,
      })
    }
    return repeatResult
  }

  function handleButtonQuestion(intent: QuestionIntent) {
    tapFeedback()
    appendEvent({ intent, timestamp: new Date().toISOString(), rawInput: '' })
    const repeatResult = logRepeatIfNeeded(intent)
    const result = buildAnswer(intent, profile, repeatResult.isRepeat, '')
    setActiveAnswer({ text: result.text, photoUrl: result.photoUrl, offerSlideshow: result.offerSlideshow })
    speak(result.text, muted)
  }

  function handleAskAnchor(text: string) {
    tapFeedback()
    const safety = checkSafety(text)
    if (safety.escalation) {
      const replyText = `I'm getting ${fallbackName} right now. Stay here with me.`
      appendAlert({
        id: crypto.randomUUID(),
        severity: 'urgent',
        message: `Safety escalation triggered by: "${safety.triggerPhrase}"`,
        timestamp: new Date().toISOString(),
        handled: false,
        triggerPhrase: safety.triggerPhrase,
      })
      setActiveAnswer({ text: replyText, offerSlideshow: false })
      speak(replyText, muted)
      return
    }
    const intent = matchIntent(text)
    appendEvent({ intent, timestamp: new Date().toISOString(), rawInput: text })
    const repeatResult = logRepeatIfNeeded(intent)
    const result = buildAnswer(intent, profile, repeatResult.isRepeat, text)
    setActiveAnswer({ text: result.text, photoUrl: result.photoUrl, offerSlideshow: result.offerSlideshow })
    speak(result.text, muted)
  }

  // "I'm feeling worried" — one-tap comfort using the profile reassurance
  function handleWorried() {
    tapFeedback()
    const reassurance = profile?.reassuranceText?.trim()
    const cg = caregiverName
    const text = reassurance
      ? `It's okay. ${reassurance}`
      : cg
        ? `It's okay. You are safe, and ${cg} is close by.`
        : "It's okay. You are safe, and someone who loves you is close by."
    appendEvent({ intent: 'feeling', timestamp: new Date().toISOString(), rawInput: 'feeling worried' })
    setActiveAnswer({ text, photoUrl: profile?.primaryCaregiver?.photoUrl, offerSlideshow: true })
    speak(text, muted)
  }

  function handleReplay() {
    if (activeAnswer) { cancelSpeech(); speak(activeAnswer.text, muted) }
  }

  function handleClose() {
    cancelSpeech()
    setActiveAnswer(null)
    setShowSlideshow(false)
  }

  const canShowSlideshow = photoCards.length > 0

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetingLine = patientName ? `${greeting}, ${patientName}` : greeting
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const firstVisitor = profile?.visitors?.[0]
  const visitorLine = firstVisitor
    ? `${firstVisitor.name} is visiting${firstVisitor.arrivalTime ? ` at ${firstVisitor.arrivalTime}` : ' today'}`
    : null

  return (
    <div className="patient-screen">
      <MuteToggle muted={muted} onToggle={() => setMuted(m => !m)} />
      <LockIcon onEnterCaregiver={onEnterCaregiver} />

      <div className="patient-greeting">
        <span className="patient-greeting__name">{greetingLine} 👋</span>
        <div className="patient-clock">
          <span className="patient-clock__time">{timeStr}</span>
          <span className="patient-clock__date">{dateStr}</span>
        </div>
        {visitorLine && <div className="patient-visitor-chip">🗓 {visitorLine}</div>}
      </div>

      <QuestionButtons caregiverName={caregiverName} onQuestion={handleButtonQuestion} />

      <AskAnchorInput onSubmit={handleAskAnchor} />

      {/* Comfort row */}
      <div className="comfort-row">
        <button className="comfort-btn comfort-btn--worried" onClick={handleWorried}>
          💗 I'm feeling worried
        </button>
        <button className="comfort-btn comfort-btn--breathe" onClick={() => { tapFeedback(); setShowBreathing(true) }}>
          🫧 Breathe with me
        </button>
      </div>

      {activeAnswer && (
        <AnswerPanel
          answer={activeAnswer.text}
          photoUrl={activeAnswer.photoUrl}
          muted={muted}
          onReplay={handleReplay}
          onLookAtPhotos={canShowSlideshow ? () => setShowSlideshow(true) : undefined}
          onClose={handleClose}
        />
      )}

      {showSlideshow && canShowSlideshow && (
        <PhotoSlideshow cards={photoCards} onClose={() => setShowSlideshow(false)} />
      )}

      {showBreathing && (
        <BreathingExercise muted={muted} onClose={() => setShowBreathing(false)} />
      )}
    </div>
  )
}
