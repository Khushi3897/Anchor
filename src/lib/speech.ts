// src/lib/speech.ts — thin wrapper around the browser SpeechSynthesis API.
// No network. No external voices. Gracefully degrades when API is absent.

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function cancelSpeech(): void {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // silently ignore
  }
}

export function speak(text: string, muted: boolean): void {
  if (muted || !isSpeechSupported()) return
  try {
    cancelSpeech()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9   // slightly slower for clarity
    utterance.pitch = 1.0
    // Prefer a device built-in voice; do not fetch remote voices
    const voices = window.speechSynthesis.getVoices()
    const local = voices.find((v) => v.localService)
    if (local) utterance.voice = local
    window.speechSynthesis.speak(utterance)
  } catch {
    // silently fail — answer text is already displayed visually
  }
}
