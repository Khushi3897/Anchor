// src/lib/types.ts — all shared TypeScript types for Anchor

export interface Caregiver {
  name: string;           // 1–50 chars
  relationship: string;   // 1–30 chars
  phone: string;
  photoUrl?: string;      // data URL
}

export interface Person {
  name: string;           // 1–50 chars
  relationship: string;   // 1–30 chars
  photoUrl?: string;      // data URL
  warmSentence: string;   // 1–100 chars
}

export interface Visitor {
  name: string;           // up to 50 chars
  arrivalTime?: string;   // up to 20 chars, e.g. "2:00 pm"
}

export interface PhotoCard {
  imageUrl: string;       // data URL
  caption: string;        // up to 80 chars
}

export interface GentleResponse {
  triggerTopic: string;   // 1–60 chars
  replyText: string;      // 1–300 chars
}

export interface LifeProfile {
  patientName: string;                // 1–50 chars
  primaryCaregiver: Caregiver;
  additionalCaregivers: Caregiver[];  // optional extras
  locationText: string;               // up to 150 chars
  reassuranceText: string;            // up to 150 chars
  todayPlan: string;                  // up to 280 chars
  visitors: Visitor[];                // up to 10
  people: Person[];                   // up to 20
  comfortItems: string[];             // 5 slots, each up to 60 chars
  photoCards: PhotoCard[];            // 0–6
  gentleResponses: GentleResponse[];  // up to 20
  isDemoPersona: boolean;
}

export type QuestionIntent =
  | 'who'
  | 'where-am-i'
  | 'what-day'
  | 'where-caregiver'
  | 'feeling'   // emotional / wellbeing questions
  | 'person'    // asking about a specific named person
  | 'unknown';

export interface QuestionEvent {
  intent: QuestionIntent;
  timestamp: string;  // ISO 8601
  rawInput: string;
}

// 'missing-info' is raised when the profile has no answer for a valid question
export type AlertSeverity = 'urgent' | 'check-in' | 'missing-info';

export interface CaregiverAlert {
  id: string;              // crypto.randomUUID()
  severity: AlertSeverity;
  message: string;
  timestamp: string;       // ISO 8601 UTC
  handled: boolean;        // caregiver can mark as handled in dashboard
  triggerPhrase?: string;  // safety escalations
  intent?: QuestionIntent; // repeat detection / unanswered intents
  repeatCount?: number;    // repeat detection
  windowStart?: string;    // ISO 8601, repeat detection window start
}
