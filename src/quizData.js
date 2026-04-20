export function parseMarkdown(text) {
  const sectionRegex = /^## (.+)$/gm
  const sections = []
  let m
  while ((m = sectionRegex.exec(text)) !== null) {
    sections.push({ index: m.index, name: m[1].replace(/^\d+\) /, ''), questions: [] })
  }

  const questionRegex = /\*\*#\d+ - (.+?)\*\*\n+((?:- \[[ x]\] .+\n?)+)/gm
  while ((m = questionRegex.exec(text)) !== null) {
    let sIdx = 0
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].index < m.index) sIdx = i
    }
    const options = []
    const optRegex = /- \[([ x])\] (.+)/g
    let om
    while ((om = optRegex.exec(m[2])) !== null) {
      options.push({ text: om[2].trim(), correct: om[1] === 'x' })
    }
    sections[sIdx].questions.push({ question: m[1], options })
  }

  return sections.map(({ name, questions }) => ({ section: name, questions }))
}

export const storageKey = (idx) => `mhq_ch_${idx}`

export function loadAnswers(idx, count) {
  try {
    const raw = sessionStorage.getItem(storageKey(idx))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === count) return parsed
    }
  } catch {}
  return new Array(count).fill(undefined)
}

export function saveAnswers(idx, answers) {
  try {
    sessionStorage.setItem(storageKey(idx), JSON.stringify(answers))
  } catch {}
}

export function clearAnswers(idx) {
  try {
    sessionStorage.removeItem(storageKey(idx))
  } catch {}
}

export function chapterStatus(idx, questions) {
  const answers = loadAnswers(idx, questions.length)
  const answered = answers.filter(a => a !== undefined).length
  const score = questions.reduce((acc, q, i) =>
    answers[i] !== undefined && q.options[answers[i]]?.correct ? acc + 1 : acc, 0)
  const status = answered === 0 ? 'pristine' : answered < questions.length ? 'progress' : 'complete'
  return { answers, answered, score, status }
}
