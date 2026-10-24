// src/components/AskAnchorInput.tsx
import { useState } from 'react'

interface AskAnchorInputProps {
  onSubmit: (text: string) => void
}

export function AskAnchorInput({ onSubmit }: AskAnchorInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="ask-anchor-row">
      <input
        className="ask-anchor-input"
        type="text"
        placeholder="Ask Anchor…"
        aria-label="Ask Anchor a question"
        maxLength={200}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="ask-anchor-send"
        aria-label="Send question"
        onClick={handleSubmit}
      >
        Send
      </button>
    </div>
  )
}
