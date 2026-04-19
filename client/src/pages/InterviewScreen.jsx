import { useState, useRef, useEffect } from 'react'
import FillerCounter from '../components/FillerCounter'
import styles from '../styles/InterviewScreen.module.css'

const CATEGORIES = [
  'Confidence', 'Filler Control', 'Answer Structure',
  'Cultural Alignment', 'Follow-up Handling',
]

export default function InterviewScreen({
  region, role, persona, messages,
  questionNum, loading, error,
  onSubmitAnswer,
}) {
  const [draft, setDraft] = useState('')
  const chatRef = useRef(null)
  const textareaRef = useRef(null)

  const isComplete = questionNum > 3 && !loading
  const interviewerMessages = messages.filter(m => m.from === 'interviewer')

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!loading && textareaRef.current) textareaRef.current.focus()
  }, [loading])

  function handleSubmit() {
    if (!draft.trim() || loading) return
    onSubmitAnswer(draft.trim())
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  const wordCount = draft.trim()
    ? draft.trim().split(/\s+/).length
    : 0

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.logo}>
          WORLD<span className={styles.logoAccent}>READY</span>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          {[1, 2, 3].map(n => (
            <div key={n} className={styles.progressStep}>
              <div className={`${styles.progressDot}
                ${n < questionNum ? styles.progressDone : ''}
                ${n === questionNum ? styles.progressActive : ''}
              `}>
                {n < questionNum ? '✓' : n}
              </div>
              {n < 3 && (
                <div className={`${styles.progressLine}
                  ${n < questionNum ? styles.progressLineDone : ''}
                `} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.roleBadge}>
          {role} · {region?.label}
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>

        {/* Left — Persona */}
        <aside className={styles.persona}>
          <div className={styles.personaAvatar}>
            {region?.flag}
          </div>
          <div className={styles.personaName}>
            {persona?.name || region?.interviewer}
          </div>
          <div className={styles.personaTitle}>
            {persona?.title || region?.title}
          </div>
          <div className={styles.personaTag}>
            {region?.styleTag}
          </div>
          <p className={styles.personaStyle}>
            {persona?.style || region?.style}
          </p>

          <div className={styles.personaStatus}>
            <div className={`${styles.statusDot} ${loading ? styles.statusLoading : styles.statusListening}`} />
            <span>{loading ? 'Thinking...' : 'Listening'}</span>
          </div>

          <div className={styles.personaDivider} />

          <div className={styles.personaExpects}>
            <div className={styles.personaExpectsLabel}>EVALUATING</div>
            {CATEGORIES.map(cat => (
              <div key={cat} className={styles.personaExpectsItem}>
                <div className={styles.personaExpectsDot} />
                {cat}
              </div>
            ))}
          </div>
        </aside>

        {/* Right — Chat */}
        <div className={styles.chat}>
          <div className={styles.chatMessages} ref={chatRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.bubble}
                  ${msg.from === 'interviewer' ? styles.bubbleInterviewer : styles.bubbleUser}
                `}
              >
                {msg.from === 'interviewer' && (
                  <div className={styles.bubbleAvatar}>{region?.flag}</div>
                )}
                <div className={`${styles.bubbleText}
                  ${msg.from === 'interviewer' ? styles.bubbleTextInterviewer : styles.bubbleTextUser}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.bubble} ${styles.bubbleInterviewer}`}>
                <div className={styles.bubbleAvatar}>{region?.flag}</div>
                <div className={`${styles.bubbleText} ${styles.bubbleTextInterviewer}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}
          </div>

          {/* Answer area */}
          {!isComplete && (
            <div className={styles.answerArea}>
              <textarea
                ref={textareaRef}
                className={styles.answerInput}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                rows={4}
                disabled={loading}
              />
              <div className={styles.answerMeta}>
                <div className={styles.answerMetaLeft}>
                  <FillerCounter text={draft} />
                  <span className={styles.wordCount}>
                    {wordCount > 0 ? `${wordCount} words` : ''}
                  </span>
                </div>
                {error && <span className={styles.error}>{error}</span>}
                <button
                  className={`${styles.submitBtn} ${draft.trim() && !loading ? styles.submitBtnActive : styles.submitBtnDisabled}`}
                  onClick={handleSubmit}
                  disabled={!draft.trim() || loading}
                >
                  {loading ? '...' : questionNum >= 3 ? 'Submit + Analyze →' : 'Submit →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}