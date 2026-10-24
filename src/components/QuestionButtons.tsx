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
      <button className="question-btn question-btn--who" onClick={() => onQuestion('who')}>
        <span className="question-btn__icon" aria-hidden="true">👥</span>
        Who is here?
      </button>
      <button className="question-btn question-btn--where" onClick={() => onQuestion('where-am-i')}>
        <span className="question-btn__icon" aria-hidden="true">🏠</span>
        Where am I?
      </button>
      <button className="question-btn question-btn--when" onClick={() => onQuestion('what-day')}>
        <span className="question-btn__icon" aria-hidden="true">📅</span>
        What day is it?
      </button>
      <button className="question-btn question-btn--carer" onClick={() => onQuestion('where-caregiver')}>
        <span className="question-btn__icon" aria-hidden="true">💛</span>
        {label}
      </button>
    </div>
  )
}
