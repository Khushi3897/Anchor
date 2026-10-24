// src/components/QuestionButtons.tsx
import type { QuestionIntent } from '../lib/types'

interface QuestionButtonsProps {
  caregiverName?: string
  onQuestion: (intent: QuestionIntent) => void
}

export function QuestionButtons({ caregiverName, onQuestion }: QuestionButtonsProps) {
  const label = caregiverName ? `Where is ${caregiverName}?` : 'Where is your caregiver?'

  return (
    <div className="question-buttons" role="group" aria-label="Questions">
      <button className="question-btn" onClick={() => onQuestion('who')}>
        👥 Who is here?
      </button>
      <button className="question-btn" onClick={() => onQuestion('where-am-i')}>
        🏠 Where am I?
      </button>
      <button className="question-btn" onClick={() => onQuestion('what-day')}>
        📅 What day is it?
      </button>
      <button className="question-btn" onClick={() => onQuestion('where-caregiver')}>
        💛 {label}
      </button>
    </div>
  )
}
