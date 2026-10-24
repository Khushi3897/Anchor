// src/data/demoPersona.ts — fully fictional demo data. No real names, photos, or details.
import type { LifeProfile } from '../lib/types'

// Placeholder SVG data URLs (no network required)
const PLACEHOLDER_BLUE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%234A90D9"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48">👤</text></svg>'
const PLACEHOLDER_GREEN =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%2350A060"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48">🌿</text></svg>'
const PLACEHOLDER_AMBER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23D4A017"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48">🌻</text></svg>'
const PLACEHOLDER_ROSE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23C06080"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48">🌹</text></svg>'

export const demoPersona: LifeProfile = {
  patientName: 'Florence',
  primaryCaregiver: {
    name: 'Rosie',
    relationship: 'daughter',
    phone: '555-0100',
    photoUrl: PLACEHOLDER_BLUE,
  },
  additionalCaregivers: [
    {
      name: 'Marcus',
      relationship: 'home carer',
      phone: '555-0101',
    },
  ],
  locationText: 'You are at home at Maple Cottage, the house you have lived in for 35 years.',
  reassuranceText: 'You are safe and comfortable here.',
  todayPlan: 'This morning we will have tea in the garden. This afternoon Rosie will visit.',
  visitors: [
    { name: 'Rosie', arrivalTime: '2:00 pm' },
    { name: 'Dr. Patel', arrivalTime: '4:30 pm' },
  ],
  people: [
    {
      name: 'Rosie',
      relationship: 'daughter',
      photoUrl: PLACEHOLDER_BLUE,
      warmSentence: 'Rosie loves you very much and visits every day.',
    },
    {
      name: 'Marcus',
      relationship: 'home carer',
      photoUrl: PLACEHOLDER_GREEN,
      warmSentence: 'Marcus helps around the house and always makes you laugh.',
    },
    {
      name: 'Buddy',
      relationship: 'dog',
      warmSentence: 'Buddy is your golden retriever and loves sitting by your feet.',
    },
  ],
  comfortItems: [
    'Cup of Earl Grey tea',
    'Knitting by the fire',
    'The garden in bloom',
    'Classic radio programmes',
    'Family photo album',
  ],
  photoCards: [
    { imageUrl: PLACEHOLDER_AMBER, caption: 'The garden at Maple Cottage in summer' },
    { imageUrl: PLACEHOLDER_ROSE, caption: 'Florence and Rosie at the seaside, 1998' },
    { imageUrl: PLACEHOLDER_BLUE, caption: 'Buddy on a morning walk through the park' },
    { imageUrl: PLACEHOLDER_GREEN, caption: "Florence's favourite armchair by the window" },
  ],
  gentleResponses: [
    {
      triggerTopic: 'go home',
      replyText:
        'You are already home, my dear — at Maple Cottage, where you have always been. Rosie will be here soon.',
    },
    {
      triggerTopic: 'mum',
      replyText:
        'Your mum was a wonderful person. She is not here right now, but you are surrounded by people who love you.',
    },
    {
      triggerTopic: 'husband',
      replyText:
        'George loved you very much. He is at peace. Rosie and the family are here to look after you.',
    },
  ],
  isDemoPersona: true,
}
