import { useState, useEffect } from 'react'
import Header from './Header'
import QuizHub from './QuizHub'
import Quiz from './Quiz'
import QuizReview from './QuizReview'
import { parseMarkdown, clearAnswers } from './quizData'
import './App.css'

export default function App() {
  const [chapters, setChapters] = useState([])
  const [view, setView] = useState('hub')        // 'hub' | 'quiz' | 'review'
  const [activeIdx, setActiveIdx] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}quiz.md`)
      .then(r => r.text())
      .then(text => setChapters(parseMarkdown(text)))
  }, [])

  const openQuiz   = (idx) => { setActiveIdx(idx); setView('quiz') }
  const openReview = (idx) => { setActiveIdx(idx); setView('review') }
  const goHub      = ()    => { setView('hub'); setActiveIdx(null) }

  const retakeChapter = (idx) => {
    clearAnswers(idx)
    openQuiz(idx)
  }

  const chapter = activeIdx !== null ? chapters[activeIdx] : null

  return (
    <>
      <Header />
      {view === 'hub' && (
        <QuizHub chapters={chapters} onStart={openQuiz} onReview={openReview} />
      )}
      {view === 'quiz' && chapter && (
        <Quiz
          chapter={chapter}
          chapterIndex={activeIdx}
          onComplete={() => openReview(activeIdx)}
          onBack={goHub}
        />
      )}
      {view === 'review' && chapter && (
        <QuizReview
          chapter={chapter}
          chapterIndex={activeIdx}
          onBack={goHub}
          onRetake={() => retakeChapter(activeIdx)}
        />
      )}
    </>
  )
}
