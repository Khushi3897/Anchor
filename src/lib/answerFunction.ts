// src/lib/answerFunction.ts — deterministic, profile-driven answer generator
// Produces all answers exclusively from LifeProfile data. Never invents facts.

import type { QuestionIntent, LifeProfile } from './types'
import { appendAlert } from './storage'
import { isPainfulTopic } from './intentMatcher'

export interface AnswerResult {
  text: string
  photoUrl?: string    // relevant photo data URL, if any
  alertWritten: boolean
}

const COMFORT_PHRASES = [
  "It's okay, I'm right here with you.",
  "You're safe. I'm here.",
  "Everything is all right.",
]

function getComfortPhrase(): string {
  return COMFORT_PHRASES[Math.floor(Math.random() * COMFORT_PHRASES.length)]
}

function caregiverFallback(profile: LifeProfile | null): string {
  const name = profile?.primaryCaregiver?.name
  return name ? `I'll get ${name}.` : "I'll get your caregiver."
}

/** Check gentle responses first — returns verbatim reply or null */
function findGentleResponse(rawInput: string, profile: LifeProfile): string | null {
  if (!isPainfulTopic(rawInput) || profile.gentleResponses.length === 0) return null
  for (const gr of profile.gentleResponses) {
    if (rawInput.toLowerCase().includes(gr.triggerTopic.toLowerCase())) {
      return gr.replyText // verbatim, no modification
    }
  }
  return null
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildAnswer(
  intent: QuestionIntent,
  profile: LifeProfile | null,
  isRepeat: boolean,
  rawInput = '',
  repeatComfortPhrase?: string,
): AnswerResult {
  const prefix = isRepeat ? (repeatComfortPhrase ?? getComfortPhrase()) + ' ' : ''

  if (!profile) {
    writeCheckInAlert('unknown', 'No life profile found', rawInput)
    return { text: caregiverFallback(null), alertWritten: true }
  }

  // Check gentle responses before intent-specific logic
  const gentle = findGentleResponse(rawInput, profile)
  if (gentle) {
    return { text: prefix + gentle, alertWritten: false }
  }

  switch (intent) {
    case 'who': {
      const caregiverName = profile.primaryCaregiver?.name
      if (!caregiverName) {
        writeCheckInAlert('who', 'Missing caregiver name for "who" answer', rawInput)
        return { text: caregiverFallback(profile), alertWritten: true }
      }
      const parts: string[] = [`${caregiverName} is here.`]
      const otherPeople = profile.people.slice(0, 2)
      if (otherPeople.length > 0) {
        const names = otherPeople.map((p) => `${p.name} (${p.relationship})`).join(' and ')
        parts.push(`${names} ${otherPeople.length === 1 ? 'is' : 'are'} also here.`)
      }
      const photoUrl = profile.people.find((p) => p.photoUrl)?.photoUrl
        ?? profile.primaryCaregiver.photoUrl
      return { text: prefix + parts.join(' '), photoUrl, alertWritten: false }
    }

    case 'where-am-i': {
      const loc = profile.locationText?.trim()
      const reassurance = profile.reassuranceText?.trim()
      if (!loc && !reassurance) {
        writeCheckInAlert('where-am-i', 'Missing location and reassurance text', rawInput)
        return { text: prefix + caregiverFallback(profile), alertWritten: true }
      }
      if (!loc) {
        writeCheckInAlert('where-am-i', 'Missing location text', rawInput)
        return { text: prefix + reassurance, alertWritten: true }
      }
      const text = reassurance ? `${loc} ${reassurance}` : loc
      return { text: prefix + text, alertWritten: false }
    }

    case 'what-day': {
      const dateStr = formatDate()
      const plan = profile.todayPlan?.trim()
      const visitors = profile.visitors ?? []

      let sentence1 = `Today is ${dateStr}.`
      let sentence2 = ''

      if (plan) {
        sentence2 = plan
      } else if (visitors.length > 0) {
        const visitorList = visitors
          .map((v) => v.arrivalTime ? `${v.name} at ${v.arrivalTime}` : v.name)
          .join(', ')
        sentence2 = `You have visitors today: ${visitorList}.`
      }

      const text = sentence2 ? `${sentence1} ${sentence2}` : sentence1
      return { text: prefix + text, alertWritten: false }
    }

    case 'where-caregiver': {
      const cg = profile.primaryCaregiver
      if (!cg?.name) {
        writeCheckInAlert('where-caregiver', 'Missing caregiver info', rawInput)
        return { text: prefix + caregiverFallback(profile), alertWritten: true }
      }
      const text = `${cg.name} will be with you soon. ${cg.relationship ? `${cg.name} is your ${cg.relationship}.` : ''}`
        .trim()
        .replace(/\s+/g, ' ')
      return {
        text: prefix + text,
        photoUrl: cg.photoUrl,
        alertWritten: false,
      }
    }

    case 'unknown':
    default: {
      writeCheckInAlert('unknown', `Unrecognised question: "${rawInput}"`, rawInput)
      return { text: prefix + caregiverFallback(profile), alertWritten: true }
    }
  }
}

function writeCheckInAlert(
  intent: QuestionIntent,
  message: string,
  rawInput: string,
): void {
  appendAlert({
    id: crypto.randomUUID(),
    severity: 'check-in',
    message,
    timestamp: new Date().toISOString(),
    intent,
    triggerPhrase: rawInput || undefined,
  })
}
