import { useState, useCallback } from 'react'
import { loadAnswers, saveAnswers } from './quizData'

export default function Quiz({ chapter, chapterIndex, onComplete, onBack }) {
  const { section, questions } = chapter
  const count = questions.length

  const [answers, setAnswers] = useState(() => loadAnswers(chapterIndex, count))
  const [current, setCurrent] = useState(() => {
    const saved = loadAnswers(chapterIndex, count)
    const first = saved.findIndex(a => a === undefined)
    return first === -1 ? 0 : first
  })
  const [fading, setFading] = useState(false)

  const fade = useCallback((fn) => {
    setFading(true)
    setTimeout(() => { fn(); setFading(false) }, 250)
  }, [])

  const handleAnswer = useCallback((optIdx) => {
    const next = [...answers]
    next[current] = optIdx
    saveAnswers(chapterIndex, next)
    fade(() => {
      setAnswers(next)
      if (current + 1 >= count) onComplete()
      else setCurrent(current + 1)
    })
  }, [current, answers, count, chapterIndex, fade, onComplete])

  const handleContinue = useCallback(() => {
    fade(() => {
      if (current + 1 >= count) onComplete()
      else setCurrent(current + 1)
    })
  }, [current, count, fade, onComplete])

  const handleBack = useCallback(() => {
    if (current > 0) fade(() => setCurrent(c => c - 1))
    else onBack()
  }, [current, fade, onBack])

  const q = questions[current]
  const selected = answers[current]
  const progress = (current / count) * 100

  return (
    <main className="quiz-shell">
      <div className={`quiz-card${fading ? ' fading' : ''}`}>
        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemax={count}
          aria-label={`Spørgsmål ${current + 1} af ${count}`}
        >
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-card-body">
          <div className="quiz-meta">
            <button className="quiz-btn-back" onClick={handleBack}>
              ← {current === 0 ? 'Oversigt' : 'Tilbage'}
            </button>
            <span className="quiz-counter" aria-hidden="true">{current + 1} / {count}</span>
          </div>

          <p className="quiz-section">{section}</p>
          <h2 className="quiz-question">{q.question}</h2>

          <ol className="quiz-options" role="list">
            {q.options.map((opt, i) => (
              <li key={i}>
                <button
                  className={`quiz-option${selected === i ? ' selected' : ''}`}
                  onClick={() => handleAnswer(i)}
                  aria-pressed={selected === i}
                >
                  {opt.text}
                </button>
              </li>
            ))}
          </ol>

          {selected !== undefined && (
            <div className="quiz-nav-row">
              <button className="quiz-btn-continue" onClick={handleContinue}>
                {current + 1 < count ? 'Næste →' : 'Se svar →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
