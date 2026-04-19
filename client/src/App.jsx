import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import InterviewScreen from './pages/InterviewScreen'
import ResultsScreen from './pages/ResultsScreen'

const USE_MOCK = true // flip to false when Spring Boot is ready

const MOCK_RESPONSES = {
  startInterview: {
    persona: {
      name: 'James Whitmore',
      title: 'Senior Partner, Whitmore & Associates',
      region: 'London',
      style: 'Structured competency questions, STAR method expected, measured tone, professional distance.',
    },
    question: "Good morning. Sit down. We'll begin promptly. Walk me through your experience and what specifically draws you to this role.",
  },
  nextQuestions: [
    "Quite. Now — describe a situation where you were under significant pressure. What did you do, and what was the measurable outcome?",
    "I see. Final question. Where do you see yourself in five years, and how does this role serve that trajectory?",
  ],
  analyze: {
    scores: {
      confidence: 78,
      fillerControl: 82,
      answerStructure: 71,
      culturalAlignment: 85,
      followUpHandling: 74,
    },
    feedback: {
      confidence: 'You projected authority well. Avoid hedging phrases like "I think" — state your positions directly.',
      fillerControl: 'Clean delivery overall. A few instances of padding mid-answer — pause instead of filling.',
      answerStructure: 'Strong opening and closing on most answers. The middle sections occasionally lost focus.',
      culturalAlignment: 'You matched the formal register well. James Whitmore values composure — you demonstrated it.',
      followUpHandling: 'Good anticipation of follow-ups on Q2. Q3 could have addressed the "why this firm" angle proactively.',
    },
  },
}

const PHASES = {
  LANDING:   'landing',
  INTERVIEW: 'interview',
  RESULTS:   'results',
}

const BASE_URL = 'http://localhost:8080'

export default function App() {
  const [phase,      setPhase]      = useState(PHASES.LANDING)
  const [region,     setRegion]     = useState(null)
  const [role,       setRole]       = useState('')
  const [persona,    setPersona]    = useState(null)
  const [messages,   setMessages]   = useState([])
  const [history,    setHistory]    = useState([])
  const [questionNum,setQuestionNum]= useState(1)
  const [scores,     setScores]     = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleBegin(selectedRegion, enteredRole) {
  setError('')
  setLoading(true)
  try {
    let data
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800)) // fake latency
      data = MOCK_RESPONSES.startInterview
    } else {
      const res = await fetch(`${BASE_URL}/start-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegion.id, role: enteredRole }),
      })
      data = await res.json()
    }
    setRegion(selectedRegion)
    setRole(enteredRole)
    setPersona(data.persona)
    setMessages([{ from: 'interviewer', text: data.question }])
    setHistory([])
    setQuestionNum(1)
    setPhase(PHASES.INTERVIEW)
  } catch {
    setError('Cannot reach server. Is Spring Boot running on port 8080?')
  }
  setLoading(false)
}

async function handleSubmitAnswer(answer) {
  const newHistory = [...history, { q: messages[messages.length - 1].text, a: answer }]
  setHistory(newHistory)
  setMessages(prev => [...prev, { from: 'user', text: answer }])
  setLoading(true)

  if (questionNum >= 3) {
    try {
      let data
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 1200))
        data = MOCK_RESPONSES.analyze
      } else {
        const res = await fetch(`${BASE_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: region.id, role, history: newHistory }),
        })
        data = await res.json()
      }
      setScores(data)
      setPhase(PHASES.RESULTS)
    } catch {
      setError('Analysis failed.')
    }
  } else {
    try {
      let data
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 900))
        data = { question: MOCK_RESPONSES.nextQuestions[questionNum - 1] }
      } else {
        const res = await fetch(`${BASE_URL}/next-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: region.id, role,
            history: newHistory,
            questionNumber: questionNum,
          }),
        })
        data = await res.json()
      }
      setMessages(prev => [...prev, { from: 'interviewer', text: data.question }])
      setQuestionNum(q => q + 1)
    } catch {
      setError('Failed to get next question.')
    }
  }
  setLoading(false)
}
  function handleRestart() {
    setPhase(PHASES.LANDING)
    setRegion(null)
    setRole('')
    setPersona(null)
    setMessages([])
    setHistory([])
    setQuestionNum(1)
    setScores(null)
    setError('')
  }

  return (
    <>
      {phase === PHASES.LANDING && (
        <LandingPage
          onBegin={handleBegin}
          loading={loading}
          error={error}
        />
      )}
      {phase === PHASES.INTERVIEW && (
        <InterviewScreen
          region={region}
          role={role}
          persona={persona}
          messages={messages}
          questionNum={questionNum}
          loading={loading}
          error={error}
          onSubmitAnswer={handleSubmitAnswer}
          onFinish={() => setPhase(PHASES.RESULTS)}
        />
      )}
      {phase === PHASES.RESULTS && (
        <ResultsScreen
          region={region}
          role={role}
          persona={persona}
          scores={scores}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}