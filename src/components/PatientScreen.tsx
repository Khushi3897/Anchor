// src/components/PatientScreen.tsx
import { useState } from 'react'
import { LockIcon } from './LockIcon'
import { MuteToggle } from './MuteToggle'
import { QuestionButtons } from './QuestionButtons'
import { AskAnchorInput } from './AskAnchorInput'
import { AnswerPanel } from './AnswerPanel'
import { PhotoSlideshow } from './PhotoSlideshow'
import { checkSafety } from '../lib/safetyChecker'
import { matchIntent } from '../lib/intentMatcher'
import { checkRepeat } from '../lib/repeatDetector'
import { buildAnswer } from '../lib/answerFunction'
import { speak, cancelSpeech } from '../lib/speech'
import { loadProfile, loadEvents, appendEvent, appendAlert } from '../lib/storage'
import type { QuestionIntent } from '../lib/types'

interface PatientScreenProps {
  onEnterCaregiver: () => void
}

interface ActiveAnswer {
  text: string
  photoUrl?: string
}

export function PatientScreen({ onEnterCaregiver }: PatientScreenProps) {
  const [muted, setMuted] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<ActiveAnswer | null>(null)
  const [showSlideshow, setShowSlideshow] = useState(false)

  const profile = loadProfile()
  const caregiverName = profile?.primaryCaregiver?.name
  const photoCards = profile?.photoCards ?? []

  const fallbackName = caregiverName ?? 'your caregiver'

  function handleQuestion(intent: QuestionIntent, rawInput = '') {
    // 1. Safety Checker first — always
    const safety = checkSafety(rawInput || intent)
    if (safety.escalation) {
      const replyText = `I'm getting ${fallbackName} right now. Stay here with me.`
      appendAlert({
        id: crypto.randomUUID(),
        severity: 'urgent',
        message: `Safety escalation triggered by: "${safety.triggerPhrase}"`,
        timestamp: new Date().toISOString(),
        triggerPhrase: safety.triggerPhrase,
      })
      setActiveAnswer({ text: replyText })
      speak(replyText, muted)
      return
    }

    // 2. Log event
    const event = {
      intent,
      timestamp: new Date().toISOString(),
      rawInput,
    }
    appendEvent(event)

    // 3. Repeat detection
    const events = loadEvents()
    const repeatResult = checkRepeat(intent, events)
    if (repeatResult.isRepeat) {
      appendAlert({
        id: crypto.randomUUID(),
        severity: 'check-in',
        message: `"${intent}" asked ${repeatResult.count} times in 10 minutes. May signal an unmet need (hunger, thirst, bathroom, pain, tiredness, loneliness, noise, or temperature).`,
        timestamp: new Date().toISOString(),
        intent,
        repeatCount: repeatResult.count,
        windowStart: repeatResult.windowStart,
      })
    }

    // 4. Build answer
    const result = buildAnswer(intent, profile, repeatResult.isRepeat, rawInput)

    // 5. Display and speak
    setActiveAnswer({ text: result.text, photoUrl: result.photoUrl })
    speak(result.text, muted)
  }

  function handleAskAnchor(text: string) {
    // Safety check on raw text first
    const safety = checkSafety(text)
    if (safety.escalation) {
      const replyText = `I'm getting ${fallbackName} right now. Stay here with me.`
      appendAlert({
        id: crypto.randomUUID(),
        severity: 'urgent',
        message: `Safety escalation triggered by: "${safety.triggerPhrase}"`,
        timestamp: new Date().toISOString(),
        triggerPhrase: safety.triggerPhrase,
      })
      setActiveAnswer({ text: replyText })
      speak(replyText, muted)
      return
    }

    const intent = matchIntent(text)
    handleQuestion(intent, text)
  }

  function handleReplay() {
    if (activeAnswer) {
      cancelSpeech()
      speak(activeAnswer.text, muted)
    }
  }

  function handleClose() {
    cancelSpeech()
    setActiveAnswer(null)
  }

  function handleLookAtPhotos() {
    setShowSlideshow(true)
  }

  return (
    <div className="patient-screen">
      <MuteToggle muted={muted} onToggle={() => setMuted((m) => !m)} />
      <LockIcon onEnterCaregiver={onEnterCaregiver} />

      <QuestionButtons
        caregiverName={caregiverName}
        onQuestion={(intent) => handleQuestion(intent)}
      />

      <AskAnchorInput onSubmit={handleAskAnchor} />

      {activeAnswer && (
        <AnswerPanel
          answer={activeAnswer.text}
          photoUrl={activeAnswer.photoUrl}
          muted={muted}
          onReplay={handleReplay}
          onLookAtPhotos={photoCards.length > 0 ? handleLookAtPhotos : undefined}
          onClose={handleClose}
        />
      )}

      {showSlideshow && photoCards.length > 0 && (
        <PhotoSlideshow
          cards={photoCards}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  )
}
