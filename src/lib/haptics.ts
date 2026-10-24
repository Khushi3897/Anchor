// src/lib/haptics.ts — gentle tap feedback. Graceful no-op where unsupported.
// Vibration is a local device capability, no network involved.

export function tapFeedback(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12) // very short, gentle
    }
  } catch {
    // ignore — feedback is a nicety, never required
  }
}
