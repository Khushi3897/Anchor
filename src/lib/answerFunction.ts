// src/lib/answerFunction.ts — deterministic, profile-driven answer generator
// Produces all answers exclusively from LifeProfile data. Never invents facts.

import type { QuestionIntent, LifeProfile } from './types'
import { appendAlert } from './storage'
import { isPainfulTopic } from './intentMatcher'

export type VisualTheme = 'who' | 'where' | 'day' | 'caregiver' | 'feeling' | 'comfort' | 'safe'

export interface AnswerResult {
  text: string
  photoUrl?: string       // relevant photo data URL, if any
  visualIcon: string      // themed emoji shown large when no photo exists
  visualTheme: VisualTheme // drives the glow colour behind the visual
  alertWritten: boolean
  offerSlideshow: boolean // true when repeat comfort phrase was used
}

// Themed fallback visuals — big friendly icon + colour theme per intent
const VISUALS: Record<VisualTheme, string> = {
  who:       '👨‍👩‍👧',
  where:     '🏡',
  day:       '🌤️',
  caregiver: '💛',
  feeling:   '🤗',
  comfort:   '🕊️',
  safe:      '🛟',
}

// The exact phrase specified for repeat detection (Req 14.3 / steering file)
const REPEAT_COMFORT_PREFIX = "It's okay to wonder. You're safe."

// Calming activity offer appended on repeat (directs to photo slideshow)
const REPEAT_ACTIVITY_OFFER = 'Would you like to look at some photos?'

function caregiverName(profile: LifeProfile | null): string {
  return profile?.primaryCaregiver?.name ?? ''
}

function caregiverFallback(profile: LifeProfile | null): string {
  const name = caregiverName(profile)
  return name ? `I'm not sure. I'll get ${name}.` : "I'm not sure. I'll get your caregiver."
}

/** Check gentle responses — returns verbatim reply or null */
function findGentleResponse(rawInput: string, profile: LifeProfile): string | null {
  if (profile.gentleResponses.length === 0) return null
  for (const gr of profile.gentleResponses) {
    if (rawInput.toLowerCase().includes(gr.triggerTopic.toLowerCase())) {
      return gr.replyText // verbatim — never modified
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

function makeResult(
  text: string,
  theme: VisualTheme,
  opts: { photoUrl?: string; alertWritten?: boolean; offerSlideshow?: boolean } = {},
): AnswerResult {
  return {
    text,
    photoUrl: opts.photoUrl,
    visualIcon: VISUALS[theme],
    visualTheme: theme,
    alertWritten: opts.alertWritten ?? false,
    offerSlideshow: opts.offerSlideshow ?? false,
  }
}

export function buildAnswer(
  intent: QuestionIntent,
  profile: LifeProfile | null,
  isRepeat: boolean,
  rawInput = '',
): AnswerResult {
  // Repeat prefix: exact wording + calming activity offer
  const prefix = isRepeat ? `${REPEAT_COMFORT_PREFIX} ` : ''
  const suffix = isRepeat ? ` ${REPEAT_ACTIVITY_OFFER}` : ''
  const offerSlideshow = isRepeat

  if (!profile) {
    writeMissingInfoAlert('unknown', 'No life profile found', rawInput)
    return makeResult(caregiverFallback(null), 'caregiver', { alertWritten: true })
  }

  // Painful-topic: check gentle responses first (regardless of intent)
  if (isPainfulTopic(rawInput)) {
    const gentle = findGentleResponse(rawInput, profile)
    if (gentle) {
      return makeResult(prefix + gentle + suffix, 'comfort', { offerSlideshow })
    }
    // Painful topic but no gentle response — comfort without adding facts, raise check-in
    writeCheckInAlert(
      'unknown',
      `Painful topic detected in: "${rawInput}" — no gentle response configured.`,
      rawInput,
    )
    const cgName = caregiverName(profile)
    const comfort = cgName
      ? `It's okay. You are safe here. I'll get ${cgName}.`
      : "It's okay. You are safe here. I'll get your caregiver."
    return makeResult(prefix + comfort + suffix, 'comfort', { alertWritten: true, offerSlideshow })
  }

  switch (intent) {
    case 'who': {
      const cgName = caregiverName(profile)
      if (!cgName) {
        writeMissingInfoAlert('who', 'Missing caregiver name for "who" answer', rawInput)
        return makeResult(caregiverFallback(profile), 'caregiver', { alertWritten: true })
      }
      const parts: string[] = [`${cgName} is here.`]
      const otherPeople = profile.people.slice(0, 2)
      if (otherPeople.length > 0) {
        const names = otherPeople.map((p) => `${p.name} (${p.relationship})`).join(' and ')
        parts.push(`${names} ${otherPeople.length === 1 ? 'is' : 'are'} also here.`)
      }
      const photoUrl = profile.people.find((p) => p.photoUrl)?.photoUrl
        ?? profile.primaryCaregiver.photoUrl
      return makeResult(prefix + parts.join(' ') + suffix, 'who', { photoUrl, offerSlideshow })
    }

    case 'where-am-i': {
      const loc = profile.locationText?.trim()
      const reassurance = profile.reassuranceText?.trim()
      if (!loc && !reassurance) {
        writeMissingInfoAlert('where-am-i', 'Missing location and reassurance text', rawInput)
        return makeResult(caregiverFallback(profile), 'caregiver', { alertWritten: true })
      }
      if (!loc) {
        writeMissingInfoAlert('where-am-i', 'Missing location text', rawInput)
        return makeResult(prefix + reassurance! + suffix, 'where', { alertWritten: true, offerSlideshow })
      }
      const text = reassurance ? `${loc} ${reassurance}` : loc
      return makeResult(prefix + text + suffix, 'where', { offerSlideshow })
    }

    case 'what-day': {
      const dateStr = formatDate()
      const plan = profile.todayPlan?.trim()
      const visitors = profile.visitors ?? []

      const sentence1 = `Today is ${dateStr}.`
      let sentence2 = ''
      if (plan) {
        sentence2 = plan
      } else if (visitors.length > 0) {
        const list = visitors
          .map((v) => (v.arrivalTime ? `${v.name} at ${v.arrivalTime}` : v.name))
          .join(', ')
        sentence2 = `You have visitors today: ${list}.`
      }

      const text = sentence2 ? `${sentence1} ${sentence2}` : sentence1
      return makeResult(prefix + text + suffix, 'day', { offerSlideshow })
    }

    case 'where-caregiver': {
      const cg = profile.primaryCaregiver
      if (!cg?.name) {
        writeMissingInfoAlert('where-caregiver', 'Missing caregiver info', rawInput)
        return makeResult(caregiverFallback(profile), 'caregiver', { alertWritten: true })
      }
      const text = [
        `${cg.name} will be with you soon.`,
        cg.relationship ? `${cg.name} is your ${cg.relationship}.` : '',
      ].filter(Boolean).join(' ')
      return makeResult(prefix + text + suffix, 'caregiver', { photoUrl: cg.photoUrl, offerSlideshow })
    }

    case 'feeling': {
      // Acknowledge the feeling, give the reassurance if available
      const reassurance = profile.reassuranceText?.trim()
      const cgName = caregiverName(profile)
      const base = reassurance
        ? `You are safe. ${reassurance}`
        : cgName
          ? `You are safe. ${cgName} is here for you.`
          : 'You are safe.'
      return makeResult(prefix + base + suffix, 'feeling', { offerSlideshow })
    }

    case 'person': {
      // Try to find the person in the people list
      const lower = rawInput.toLowerCase()
      const match = profile.people.find(
        (p) => p.name && lower.includes(p.name.toLowerCase()),
      )
      if (match) {
        const text = `${match.name} is your ${match.relationship}. ${match.warmSentence}`
        return makeResult(prefix + text + suffix, 'who', { photoUrl: match.photoUrl, offerSlideshow })
      }
      // Named person not in profile
      writeMissingInfoAlert('person', `Asked about unknown person: "${rawInput}"`, rawInput)
      return makeResult(caregiverFallback(profile), 'caregiver', { alertWritten: true })
    }

    case 'unknown':
    default: {
      writeMissingInfoAlert('unknown', `Unrecognised question: "${rawInput}"`, rawInput)
      return makeResult(caregiverFallback(profile), 'caregiver', { alertWritten: true })
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
    handled: false,
    intent,
    triggerPhrase: rawInput || undefined,
  })
}

function writeMissingInfoAlert(
  intent: QuestionIntent,
  message: string,
  rawInput: string,
): void {
  appendAlert({
    id: crypto.randomUUID(),
    severity: 'missing-info',
    message,
    timestamp: new Date().toISOString(),
    handled: false,
    intent,
    triggerPhrase: rawInput || undefined,
  })
}
