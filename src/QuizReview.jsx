import { loadAnswers } from './quizData'

function reviewMessage(pct) {
  if (pct === 1)   return 'Perfekt. Du svarede rigtigt på alle spørgsmål.'
  if (pct >= 0.8)  return 'Rigtig godt. Du har forstået det meste.'
  if (pct >= 0.6)  return 'Godt forsøg. Kig svarene igennem og mærk, hvad der sidder fast.'
  if (pct >= 0.4)  return 'Et godt udgangspunkt. Hvert spørgsmål er en mulighed for at lære.'
  return 'Bliv ved. Prøv igen med åbent sind.'
}

export default function QuizReview({ chapter, chapterIndex, onBack, onRetake }) {
  const { section, questions } = chapter
  const answers = loadAnswers(chapterIndex, questions.length)
  const total = questions.length
  const score = questions.reduce((acc, q, i) =>
    answers[i] !== undefined && q.options[answers[i]]?.correct ? acc + 1 : acc, 0)

  return (
    <main className="review-shell">
      <div className="review-card">

        <div className="review-header">
          <p className="quiz-section">{section}</p>
          <div className="review-score-row">
            <span className="review-score" aria-label={`${score} ud af ${total}`}>
              {score}<span className="review-score-denom">/{total}</span>
            </span>
            <p className="review-message">{reviewMessage(score / total)}</p>
          </div>
          <div className="review-header-actions">
            <button className="hub-btn-ghost" onClick={onRetake}>Prøv igen</button>
            <button className="hub-btn" onClick={onBack}>← Oversigt</button>
          </div>
        </div>

        <ol className="review-list" aria-label="Gennemgang af svar">
          {questions.map((q, qi) => {
            const userIdx = answers[qi]
            const userOpt = userIdx !== undefined ? q.options[userIdx] : null
            const correct = userOpt?.correct === true
            const correctOpt = q.options.find(o => o.correct)

            return (
              <li key={qi} className={`review-item ${correct ? 'review-item--correct' : 'review-item--wrong'}`}>
                <p className="review-q-num">Spørgsmål {qi + 1}</p>
                <p className="review-q-text">{q.question}</p>

                {correct ? (
                  <div className="review-answer review-answer--correct">
                    <span className="review-icon" aria-hidden="true">✓</span>
                    <span>{userOpt.text}</span>
                  </div>
                ) : (
                  <div className="review-answers-group">
                    {userOpt && (
                      <div className="review-answer review-answer--wrong">
                        <span className="review-icon" aria-hidden="true">✗</span>
                        <span>{userOpt.text}</span>
                      </div>
                    )}
                    <div className="review-answer review-answer--correct">
                      <span className="review-icon" aria-hidden="true">✓</span>
                      <span>{correctOpt?.text}</span>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <div className="review-footer-actions">
          <button className="hub-btn-ghost" onClick={onRetake}>Prøv igen</button>
          <button className="hub-btn" onClick={onBack}>← Tilbage til oversigt</button>
        </div>

      </div>
    </main>
  )
}
