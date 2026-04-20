import { useState, useEffect, useCallback } from 'react'

function parseMarkdown(text) {
  const sections = []
  const sectionRegex = /^## (.+)$/gm
  let m
  while ((m = sectionRegex.exec(text)) !== null) {
    sections.push({ index: m.index, name: m[1].replace(/^\d+\) /, '') })
  }

  const questions = []
  const questionRegex = /\*\*#\d+ - (.+?)\*\*\n+((?:- \[[ x]\] .+\n?)+)/gm
  while ((m = questionRegex.exec(text)) !== null) {
    let section = ''
    for (const s of sections) {
      if (s.index < m.index) section = s.name
    }
    const options = []
    const optRegex = /- \[([ x])\] (.+)/g
    let om
    while ((om = optRegex.exec(m[2])) !== null) {
      options.push({ text: om[2].trim(), correct: om[1] === 'x' })
    }
    questions.push({ section, question: m[1], options })
  }
  return questions
}

function resultMessage(pct) {
  if (pct === 1)   return 'Imponerende. Din forståelse er dyb og klar.'
  if (pct >= 0.8)  return 'Fremragende. Du har forstået det meste — og resten vil komme af sig selv.'
  if (pct >= 0.6)  return 'Godt gået. Du er på rette vej. Bliv ved med at øve.'
  if (pct >= 0.4)  return 'Et godt udgangspunkt. Hvert møde med meditation giver ny indsigt.'
  return 'Ingen bekymring. Meditation er en rejse, ikke en præstation. Prøv igen med åbent sind.'
}

function transition(fn, delay = 260) {
  return new Promise(resolve => setTimeout(() => { fn(); resolve() }, delay))
}

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [phase, setPhase] = useState('intro')   // 'intro' | 'quiz' | 'result'
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])     // answer option index per question
  const [fading, setFading] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}quiz.md`)
      .then(r => r.text())
      .then(text => setQuestions(parseMarkdown(text)))
  }, [])

  const score = questions.reduce((acc, q, i) =>
    answers[i] !== undefined && q.options[answers[i]]?.correct ? acc + 1 : acc, 0)

  const fade = useCallback((fn) => {
    setFading(true)
    transition(() => { fn(); setFading(false) })
  }, [])

  const startQuiz = useCallback(() => {
    fade(() => { setPhase('quiz'); setCurrent(0); setAnswers([]) })
  }, [fade])

  const handleAnswer = useCallback((optIndex) => {
    const next = current + 1
    const newAnswers = answers.slice()
    newAnswers[current] = optIndex
    fade(() => {
      setAnswers(newAnswers)
      if (next >= questions.length) setPhase('result')
      else setCurrent(next)
    })
  }, [current, answers, questions.length, fade])

  const handleContinue = useCallback(() => {
    const next = current + 1
    fade(() => {
      if (next >= questions.length) setPhase('result')
      else setCurrent(next)
    })
  }, [current, questions.length, fade])

  const handleBack = useCallback(() => {
    fade(() => setCurrent(c => c - 1))
  }, [fade])

  const restart = useCallback(() => {
    fade(() => { setCurrent(0); setAnswers([]); setPhase('intro') })
  }, [fade])

  const cardClass = `quiz-card${fading ? ' fading' : ''}`

  if (!questions.length) {
    return (
      <main className="quiz-shell">
        <p className="quiz-loading" aria-live="polite">···</p>
      </main>
    )
  }

  const total = questions.length

  if (phase === 'intro') {
    return (
      <main className="quiz-shell">
        <div className={cardClass}>
          <div className="quiz-card-body intro-body">
            <h1 className="intro-title">Meditationsquiz</h1>
            <p className="intro-text">
              Tag et øjeblik. Denne quiz tester din forståelse af meditation —
              roligt og uden tidspres. Der er {total} spørgsmål.
            </p>
            <button className="quiz-btn-primary" onClick={startQuiz}>
              Start quiz
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'result') {
    const pct = score / total
    return (
      <main className="quiz-shell">
        <div className={cardClass}>
          <div className="quiz-card-body result-body">
            <p className="result-label">Dit resultat</p>
            <div className="result-score" aria-label={`${score} ud af ${total}`}>
              {score}<span>/{total}</span>
            </div>
            <p className="result-message">{resultMessage(pct)}</p>
            <button className="quiz-btn-primary" onClick={restart}>
              Start forfra
            </button>
          </div>
        </div>
      </main>
    )
  }

  // quiz phase
  const q = questions[current]
  const existingAnswer = answers[current]
  const hasAnswer = existingAnswer !== undefined
  const progress = (current / total) * 100

  return (
    <main className="quiz-shell">
      <div className={cardClass}>
        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemax={total}
          aria-label={`Spørgsmål ${current + 1} af ${total}`}
        >
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-card-body">
          <div className="quiz-meta">
            {current > 0 ? (
              <button className="quiz-btn-back" onClick={handleBack} aria-label="Forrige spørgsmål">
                ← Tilbage
              </button>
            ) : (
              <span />
            )}
            <span className="quiz-counter" aria-hidden="true">{current + 1} / {total}</span>
          </div>

          <p className="quiz-section">{q.section}</p>
          <h2 className="quiz-question">{q.question}</h2>

          <ol className="quiz-options" role="list">
            {q.options.map((opt, i) => (
              <li key={i}>
                <button
                  className={`quiz-option${existingAnswer === i ? ' selected' : ''}`}
                  onClick={() => handleAnswer(i)}
                  aria-pressed={existingAnswer === i}
                >
                  {opt.text}
                </button>
              </li>
            ))}
          </ol>

          {hasAnswer && (
            <div className="quiz-nav-row">
              <button className="quiz-btn-continue" onClick={handleContinue}>
                {current + 1 < total ? 'Fortsæt →' : 'Se resultat →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
