import { chapterStatus } from './quizData'

export default function QuizHub({ chapters, onStart, onReview }) {
  if (!chapters.length) {
    return (
      <main className="quiz-shell">
        <p className="quiz-loading" aria-live="polite">···</p>
      </main>
    )
  }

  return (
    <main className="hub-shell">
      <div className="hub-intro">
        <h1 className="hub-title">Meditationsquiz</h1>
        <p className="hub-subtitle">Vælg et kapitel og test din forståelse.</p>
      </div>

      <ol className="hub-list" aria-label="Quizkapitler">
        {chapters.map((chapter, idx) => {
          const { answered, score, status } = chapterStatus(idx, chapter.questions)
          const total = chapter.questions.length
          const progressPct = (answered / total) * 100

          return (
            <li key={idx} className="hub-item">
              <div className={`hub-card hub-card--${status}`}>
                <div className="hub-card-progress-track" aria-hidden="true">
                  <div
                    className="hub-card-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="hub-card-body">
                  <div className="hub-card-main">
                    <h2 className="hub-card-title">{chapter.section}</h2>
                    <p className="hub-card-meta">
                      {total} spørgsmål
                      {status === 'progress' && (
                        <span> · {answered} besvaret</span>
                      )}
                      {status === 'complete' && (
                        <span className="hub-score"> · {score}/{total} rigtige</span>
                      )}
                    </p>
                  </div>

                  <div className="hub-card-actions">
                    {status === 'complete' && (
                      <button
                        className="hub-btn-ghost"
                        onClick={() => onStart(idx)}
                        aria-label={`Tag ${chapter.section} igen`}
                      >
                        Prøv igen
                      </button>
                    )}
                    {status !== 'pristine' && (
                      <button
                        className="hub-btn"
                        onClick={() => onReview(idx)}
                        aria-label={`Se svar for ${chapter.section}`}
                      >
                        {status === 'complete' ? 'Se svar →' : 'Fortsæt →'}
                      </button>
                    )}
                    {status === 'pristine' && (
                      <button
                        className="hub-btn"
                        onClick={() => onStart(idx)}
                        aria-label={`Start ${chapter.section}`}
                      >
                        Start →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
