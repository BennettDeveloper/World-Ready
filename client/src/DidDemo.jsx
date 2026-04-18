import React, { useEffect, useRef, useState } from 'react'

export default function DidDemo() {
  const localVideoRef = useRef(null)
  const avatarVideoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const recognitionRef = useRef(null)
  const sessionActiveRef = useRef(false) // ref avoids stale closure in recognition callbacks
  const isRespondingRef = useRef(false)   // guard against concurrent in-flight requests
  const transcriptEndRef = useRef(null)

  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [status, setStatus] = useState('idle')
  const [transcriptLog, setTranscriptLog] = useState([])
  const [manualInput, setManualInput] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('')

  useEffect(() => {
    sessionActiveRef.current = sessionActive
  }, [sessionActive])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcriptLog])

  useEffect(() => {
    return () => {
      sessionActiveRef.current = false
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        try { recognitionRef.current.stop() } catch (_) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      mediaStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setCameraOn(true)
    } catch (e) {
      console.error('Camera error:', e)
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    setCameraOn(false)
  }

  function startMicRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setStatus('speech recognition not supported')
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.continuous = true

    rec.onstart = () => setStatus('listening')

    rec.onend = () => {
      if (sessionActiveRef.current) {
        try { rec.start() } catch (_) {}
      } else {
        setStatus('idle')
      }
    }

    rec.onresult = (ev) => {
      // slice from resultIndex so we only process newly finalized results,
      // not the full accumulated history from prior utterances
      const text = Array.from(ev.results)
        .slice(ev.resultIndex)
        .filter(r => r.isFinal)
        .map(r => r[0].transcript)
        .join(' ')
        .trim()
      if (text) {
        appendTranscript('you', text)
        sendToBackend(text)
      }
    }

    rec.onerror = (e) => console.error('Recognition error:', e)
    rec.start()
    recognitionRef.current = rec
    setMicOn(true)
  }

  function stopMicRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
    setMicOn(false)
  }

  function appendTranscript(who, text) {
    setTranscriptLog(l => [...l, { who, text, ts: Date.now() }])
  }

  async function sendToBackend(text) {
    if (!text.trim() || isRespondingRef.current) return
    isRespondingRef.current = true
    setIsResponding(true)
    setStatus('thinking...')
    setAvatarMessage('')
    setAvatarVideoUrl('')
    try {
      const resp = await fetch('/api/did/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await resp.json()
      if (data.videoUrl) {
        setAvatarVideoUrl(data.videoUrl)
        setStatus('playing')
        appendTranscript('avatar', '(video response)')
      } else if (data.message) {
        setAvatarMessage(data.message)
        appendTranscript('avatar', data.message)
        speakText(data.message)
        setStatus(sessionActiveRef.current ? 'listening' : 'idle')
      }
    } catch (e) {
      console.error('Backend error:', e)
      setAvatarMessage('Could not reach backend.')
      setStatus('error')
    } finally {
      isRespondingRef.current = false
      setIsResponding(false)
    }
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    }
  }

  async function startSession() {
    setSessionActive(true)
    sessionActiveRef.current = true
    setStatus('starting...')
    setTranscriptLog([])
    setAvatarMessage('')
    setAvatarVideoUrl('')
    await startCamera()
    startMicRecognition()
  }

  function endSession() {
    sessionActiveRef.current = false
    setSessionActive(false)
    stopMicRecognition()
    stopCamera()
    setStatus('idle')
    if (avatarVideoRef.current) {
      avatarVideoRef.current.pause()
      avatarVideoRef.current.src = ''
    }
  }

  function handleManualSend() {
    const text = manualInput.trim()
    if (!text) return
    appendTranscript('you', text)
    sendToBackend(text)
    setManualInput('')
  }

  return (
    <div style={css.page}>
      <header style={css.header}>
        <span style={css.title}>World Ready — AI Interview Demo</span>
        <span style={css.statusPill}>
          <span style={{ ...css.statusDot, background: statusColor(status) }} />
          {status}
        </span>
      </header>

      <div style={css.main}>
        {/* ── Avatar panel ── */}
        <div style={css.avatarPanel}>
          <div style={css.avatarStage}>
            {avatarVideoUrl ? (
              <video
                ref={avatarVideoRef}
                src={avatarVideoUrl}
                autoPlay
                style={css.avatarVideo}
                onEnded={() => setStatus(sessionActiveRef.current ? 'listening' : 'idle')}
              />
            ) : (
              <div style={css.avatarFallback}>
                <div style={css.avatarIcon}>🤖</div>
                <p style={css.avatarSpeech}>
                  {avatarMessage || (sessionActive ? 'Listening… speak to get a response.' : 'Start a session to begin.')}
                </p>
              </div>
            )}
          </div>
          <div style={css.panelLabel}>AI Interviewer</div>
        </div>

        {/* ── Right column ── */}
        <div style={css.rightCol}>
          {/* Self-view */}
          <div style={css.selfView}>
            <div style={css.panelLabel}>You</div>
            <video ref={localVideoRef} autoPlay muted playsInline style={css.selfVideo} />
          </div>

          {/* Device controls */}
          <div style={css.card}>
            <div style={css.btnRow}>
              <button
                style={toggleBtn(cameraOn)}
                onClick={() => cameraOn ? stopCamera() : startCamera()}
              >
                {cameraOn ? '📷 Camera On' : '📷 Camera Off'}
              </button>
              <button
                style={toggleBtn(micOn)}
                onClick={() => micOn ? stopMicRecognition() : startMicRecognition()}
              >
                {micOn ? '🎤 Mic On' : '🎤 Mic Off'}
              </button>
            </div>
            <div style={css.btnRow}>
              <button style={actionBtn('#22c55e', sessionActive)} disabled={sessionActive} onClick={startSession}>
                Start Session
              </button>
              <button style={actionBtn('#ef4444', !sessionActive)} disabled={!sessionActive} onClick={endSession}>
                End Session
              </button>
            </div>
          </div>

          {/* Transcript + manual input */}
          <div style={{ ...css.card, flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={css.transcriptLabel}>Transcript</div>
            <div style={css.transcriptList}>
              {transcriptLog.length === 0 && (
                <span style={css.emptyNote}>No messages yet</span>
              )}
              {transcriptLog.map((t, i) => (
                <div key={i} style={msgBubble(t.who)}>
                  <strong style={speakerColor(t.who)}>{t.who} </strong>
                  {t.text}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
            <div style={css.inputRow}>
              <input
                style={css.textInput}
                placeholder="Type a message and press Enter…"
                value={manualInput}
                disabled={isResponding}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSend()}
              />
              <button style={{ ...css.sendBtn, opacity: isResponding ? 0.4 : 1, cursor: isResponding ? 'not-allowed' : 'pointer' }} disabled={isResponding} onClick={handleManualSend}>
                {isResponding ? '…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer style={css.footer}>
        <span>Session: {sessionActive ? 'Active' : 'Inactive'}</span>
        <span style={css.sep}>·</span>
        <span>Mic: {micOn ? 'On' : 'Off'}</span>
        <span style={css.sep}>·</span>
        <span>Camera: {cameraOn ? 'On' : 'Off'}</span>
      </footer>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

function statusColor(status) {
  if (status === 'listening') return '#22c55e'
  if (status === 'thinking...' || status === 'sending') return '#f59e0b'
  if (status === 'error') return '#ef4444'
  if (status === 'playing') return '#3b82f6'
  return '#475569'
}

function toggleBtn(active) {
  return {
    flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, transition: 'background 0.15s',
    background: active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)',
    color: active ? '#93c5fd' : '#64748b'
  }
}

function actionBtn(color, disabled) {
  return {
    flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13, fontWeight: 600,
    background: disabled ? 'rgba(255,255,255,0.04)' : color,
    color: disabled ? '#334155' : '#fff',
    transition: 'background 0.15s'
  }
}

function msgBubble(who) {
  return {
    padding: '6px 10px', borderRadius: 6, fontSize: 13, lineHeight: 1.5,
    background: who === 'you' ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.08)'
  }
}

function speakerColor(who) {
  return { color: who === 'you' ? '#60a5fa' : '#a78bfa', marginRight: 4 }
}

// ── static styles ─────────────────────────────────────────────────────────────

const css = {
  page: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    background: '#0f1724', color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    padding: '12px 20px', background: '#071428',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0
  },
  title: { fontSize: 15, fontWeight: 600, letterSpacing: 0.2 },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, padding: '4px 12px', borderRadius: 20,
    background: 'rgba(255,255,255,0.06)', color: '#94a3b8'
  },
  statusDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  main: {
    flex: '1 1 auto', display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 14, padding: 14, minHeight: 0
  },
  avatarPanel: {
    background: '#0b1220', borderRadius: 10,
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  avatarStage: {
    flex: '1 1 auto', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#060e1c', position: 'relative'
  },
  avatarVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarFallback: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20, padding: 32, textAlign: 'center'
  },
  avatarIcon: {
    width: 88, height: 88, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, boxShadow: '0 0 40px rgba(99,102,241,0.3)'
  },
  avatarSpeech: {
    fontSize: 16, lineHeight: 1.7, color: '#94a3b8',
    maxWidth: 500, margin: 0
  },
  panelLabel: {
    padding: '8px 14px', background: '#071120',
    fontSize: 12, color: '#475569', flexShrink: 0
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 },
  selfView: { background: '#0b1220', borderRadius: 10, overflow: 'hidden', flexShrink: 0 },
  selfVideo: {
    width: '100%', aspectRatio: '4/3',
    objectFit: 'cover', display: 'block', background: '#040d1c'
  },
  card: { background: '#0b1220', borderRadius: 10, padding: 12 },
  btnRow: { display: 'flex', gap: 8, marginBottom: 8 },
  transcriptLabel: { fontSize: 12, color: '#475569', marginBottom: 8, flexShrink: 0 },
  transcriptList: {
    flex: '1 1 auto', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10
  },
  emptyNote: { fontSize: 12, color: '#1e293b', textAlign: 'center', marginTop: 10 },
  inputRow: { display: 'flex', gap: 6, flexShrink: 0 },
  textInput: {
    flex: 1, padding: '8px 10px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
    fontSize: 13, outline: 'none'
  },
  sendBtn: {
    padding: '8px 14px', borderRadius: 6, border: 'none',
    background: '#3b82f6', color: '#fff',
    fontSize: 13, fontWeight: 500, cursor: 'pointer'
  },
  footer: {
    height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#071428', borderTop: '1px solid rgba(255,255,255,0.04)',
    fontSize: 12, color: '#334155', flexShrink: 0
  },
  sep: { margin: '0 10px' }
}
