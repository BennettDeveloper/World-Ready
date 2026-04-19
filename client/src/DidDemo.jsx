import { useEffect, useRef, useState } from 'react'
import { useDidAgent } from './useDidAgent'
import { createAgentManager, AgentActivityState, ConnectionState } from '@d-id/client-sdk'

const SUBMIT_DEBOUNCE_MS = 1200

export default function DidDemo() {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const localVideoRef          = useRef(null)
  const mediaStreamRef         = useRef(null)
  const recognitionRef         = useRef(null)
  const sessionActiveRef       = useRef(false)
  const isRespondingRef        = useRef(false)
  const transcriptEndRef       = useRef(null)
  const pendingTextRef         = useRef('')
  const latestInterimRef       = useRef('')
  const debounceTimerRef       = useRef(null)
  const isRecognitionActiveRef = useRef(false)
  const ignoreRecognitionRef    = useRef(false)   // hard gate: true from halt→onstart
  const awaitingAgentTurnRef    = useRef(false)   // true: msg sent, agent not yet speaking
  const agentResponseTimeoutRef = useRef(null)    // fallback: release gate if agent never speaks
  const speechErrorRef          = useRef(null)
  const sessionIdRef            = useRef(null)
  const recognitionGenerationRef = useRef(0)   // incremented on every start+halt; closures discard stale events
  const pttActiveRef             = useRef(false)  // true while Push-to-Speak is recording

  // ── State ─────────────────────────────────────────────────────────────────
  const [cameraOn,      setCameraOn]      = useState(false)
  const [micOn,         setMicOn]         = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [isResponding,  setIsResponding]  = useState(false)
  const [speechBlocked, setSpeechBlocked] = useState(false)
  const [pttActive,     setPttActive]     = useState(false)
  const [status,        setStatus]        = useState('idle')
  const [transcriptLog, setTranscriptLog] = useState([])
  const [interimText,   setInterimText]   = useState('')
  const [manualInput,   setManualInput]   = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')

  // Interview setup
  const [roleType,        setRoleType]        = useState('Software Engineer')
  const [persona,         setPersona]         = useState('US Startup Recruiter')
  const [difficulty,      setDifficulty]      = useState('Medium')
  const [jobDescription,  setJobDescription]  = useState('')
  const [resumeContext,   setResumeContext]    = useState('')

  // Session persistence + results
  const [pastSessions,    setPastSessions]    = useState([])
  const [showHistory,     setShowHistory]     = useState(false)
  const [expandedSession, setExpandedSession] = useState(null)
  const [lastResult,      setLastResult]      = useState(null)

   const [agentActivity, setAgentActivity] = useState(AgentActivityState.Idle)

  // ── Agent message handler ─────────────────────────────────────────────────
  // Called by useDidAgent when the agent delivers an answer (type='answer').
  // Defined before the hook so it can be passed as a stable prop.
  function handleAgentMessage(replyText) {
    console.log('[handleAgentMessage] fired — text:', replyText?.slice(0, 80), '| sessionId:', sessionIdRef.current)
    if (!replyText) return
    setAvatarMessage(replyText)
    appendTranscript('interviewer', replyText)
    if (sessionIdRef.current) {
      saveMessageToSession(sessionIdRef.current, 'assistant', replyText)
    }
  }

  // ── D-ID Agent SDK ────────────────────────────────────────────────────────
  const {
    agentState,
    isAgentTalking,
    isAgentTalkingRef,
    videoRef: agentVideoRef,
    connect:    connectAgent,
    whenReady:  agentWhenReady,
    chat:       agentChat,
    disconnect: disconnectAgent,
  } = useDidAgent({ onAgentMessage: handleAgentMessage })

  // Tracks whether the agent was actively speaking during the last agent turn.
  // Used by the turn-taking effect to decide if a post-speech cleanup delay is needed.
  const agentWasSpeakingRef = useRef(false)
  // Delayed-resume timer: fired 400ms after agent finishes speaking to let audio tail off
  const resumeTimerRef = useRef(null)

  // ── Effects ───────────────────────────────────────────────────────────────

  // Pre-warm: establish the agent connection as soon as the page loads.
  // setTimeout(0)+clearTimeout is Strict Mode safe — React's simulated unmount
  // clears the timer, so only the real mount fires connectAgent().
  useEffect(() => {
    const timer = setTimeout(() => {
      connectAgent().catch(() => {})
    }, 0)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { sessionActiveRef.current = sessionActive }, [sessionActive])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcriptLog])

  // ── Turn-taking: mute mic while interviewer is speaking ───────────────────
  const isAgentSpeaking = isAgentTalking
  const isAgentTurn     = isAgentSpeaking || isResponding

  useEffect(() => {
    if (!sessionActive) return

    if (isAgentTurn) {
      // Cancel any pending delayed resume — agent has the floor
      clearTimeout(resumeTimerRef.current)
      if (pttActiveRef.current) {
        pttActiveRef.current = false
        setPttActive(false)
      }
      if (isRecognitionActiveRef.current) {
        console.log('[turn] agent turn — pausing mic (speaking:', isAgentSpeaking, ')')
        pauseRecognition()
      }
      if (isAgentSpeaking) {
        // Agent has ACTUALLY started speaking — clear the "awaiting response" hold.
        // Until this fires, the mic is intentionally kept off after agentChat() resolved.
        awaitingAgentTurnRef.current = false
        clearTimeout(agentResponseTimeoutRef.current)
        agentWasSpeakingRef.current = true
        console.log('[turn] agent speaking confirmed — awaiting flag cleared, gate remains closed')
        setStatus('Interviewer speaking…')
      }
    } else {
      const needsCleanup = agentWasSpeakingRef.current
      agentWasSpeakingRef.current = false
      clearTimeout(resumeTimerRef.current)

      // agentChat() resolved but agent hasn't started speaking yet.
      // Holding mic off — this effect will re-fire when isAgentSpeaking becomes true.
      if (awaitingAgentTurnRef.current) {
        console.log('[turn] awaiting agent response — mic held off, gate closed')
        return
      }

      if (needsCleanup) setStatus('Your turn…')

      resumeTimerRef.current = setTimeout(() => {
        // Scrub any contamination accumulated during/after agent speech
        clearTimeout(debounceTimerRef.current)
        pendingTextRef.current   = ''
        latestInterimRef.current = ''
        setInterimText('')
        if (needsCleanup) console.log('[speech] buffers cleared after agent speech')

        if (micOn && !speechBlocked && !isRecognitionActiveRef.current && !isAgentTalkingRef.current) {
          if (needsCleanup) console.log('[speech] recognition restarted cleanly')
          else console.log('[turn] user turn — resuming mic')
          startMicRecognition()
        }
      }, needsCleanup ? 400 : 0)
    }
  }, [isAgentTurn, isAgentSpeaking, sessionActive, micOn, speechBlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      sessionActiveRef.current       = false
      isRecognitionActiveRef.current = false
      awaitingAgentTurnRef.current   = false
      clearTimeout(debounceTimerRef.current)
      clearTimeout(resumeTimerRef.current)
      clearTimeout(agentResponseTimeoutRef.current)
      pendingTextRef.current   = ''
      latestInterimRef.current = ''
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        try { recognitionRef.current.stop() } catch (_) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // ── Camera ────────────────────────────────────────────────────────────────
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

  // ── Speech recognition ────────────────────────────────────────────────────
  function startMicRecognition() {
    if (isRecognitionActiveRef.current) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setStatus('speech recognition not supported — use text input below'); return }

    speechErrorRef.current = null
    // Each new recognition session gets a unique generation number captured
    // in the handler closures.  _haltRecognitionEngine() increments the counter,
    // making every in-flight handler from the old session see a stale generation
    // and discard itself — no need to null handlers manually.
    const gen = ++recognitionGenerationRef.current
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = true

    rec.onstart = () => {
      if (gen !== recognitionGenerationRef.current) return  // stale session
      // Always open the gate on a fresh onstart.  The resume timer only calls
      // startMicRecognition() when it is actually safe to do so (agent done,
      // buffers clear), so ignoreRecognitionRef being true here just means
      // the previous session was halted — exactly when we want to re-open.
      ignoreRecognitionRef.current = false
      isRecognitionActiveRef.current = true
      console.log('[speech] started — gate OPEN gen:', gen)
      setStatus('listening')
    }

    rec.onend = () => {
      if (gen !== recognitionGenerationRef.current) return  // stale session
      isRecognitionActiveRef.current = false
      console.log('[speech] ended | session:', sessionActiveRef.current,
        '| error:', speechErrorRef.current,
        '| agentTalking:', isAgentTalkingRef.current,
        '| gated:', ignoreRecognitionRef.current,
        '| gen:', gen)
      const fatalErrors = ['not-allowed', 'service-not-allowed']
      // Auto-restart only when it is safe: session live, agent not speaking,
      // gate open, not awaiting response, no fatal mic error.
      if (
        sessionActiveRef.current &&
        !isAgentTalkingRef.current &&
        !ignoreRecognitionRef.current &&
        !awaitingAgentTurnRef.current &&
        !fatalErrors.includes(speechErrorRef.current)
      ) {
        try { rec.start() } catch (e) { console.error('[speech] restart failed:', e.message) }
      } else if (!sessionActiveRef.current) {
        setStatus('idle')
      }
    }

    rec.onresult = (ev) => {
      const talking = agentState === AgentActivityState.Talking
      if(talking) return;

      if (gen !== recognitionGenerationRef.current) {
        console.log('[speech] stale onresult discarded — gen', gen)
        return
      }
      // Layer 1 — gate: halted engine fired a late final result
      if (ignoreRecognitionRef.current) {
        console.log('[speech] discarded — gate closed (late result after halt)')
        clearTimeout(debounceTimerRef.current)
        pendingTextRef.current   = ''
        latestInterimRef.current = ''
        setInterimText('')
        return
      }
      // Layer 2 — agent is speaking (sync ref, no React delay)
      if (isAgentTalkingRef.current) {
        console.log('[speech] discarded — agent speaking')
        clearTimeout(debounceTimerRef.current)
        pendingTextRef.current   = ''
        latestInterimRef.current = ''
        setInterimText('')
        return
      }
      // Layer 3 — message sent, waiting for agent to start speaking
      if (awaitingAgentTurnRef.current) {
        console.log('[speech] discarded — awaiting agent turn')
        clearTimeout(debounceTimerRef.current)
        pendingTextRef.current   = ''
        latestInterimRef.current = ''
        setInterimText('')
        return
      }

      const newResults = Array.from(ev.results).slice(ev.resultIndex)
      const finalChunk = newResults.filter(r => r.isFinal).map(r => r[0].transcript).join(' ').trim()
      const interim    = newResults.filter(r => !r.isFinal).map(r => r[0].transcript).join(' ').trim()

      if (finalChunk) {
        pendingTextRef.current   = (pendingTextRef.current + ' ' + finalChunk).trim()
        latestInterimRef.current = ''
        setInterimText('')
      } else if (interim) {
        latestInterimRef.current = interim
        setInterimText(interim)
      }

      const hasContent = pendingTextRef.current || interim
      if (hasContent) {
        clearTimeout(debounceTimerRef.current)
        setStatus('finishing...')
        debounceTimerRef.current = setTimeout(() => {
          // Re-check all guards at flush time — state may have changed during 1200ms
          if (
            gen !== recognitionGenerationRef.current ||
            ignoreRecognitionRef.current ||
            isAgentTalkingRef.current ||
            awaitingAgentTurnRef.current
          ) {
            console.log('[speech] debounce flush discarded — stale or gated')
            pendingTextRef.current   = ''
            latestInterimRef.current = ''
            setInterimText('')
            return
          }
          // PTT mode: suppress auto-submit; user submits by clicking Stop
          if (pttActiveRef.current) return
          const text = (pendingTextRef.current || latestInterimRef.current).trim()
          pendingTextRef.current   = ''
          latestInterimRef.current = ''
          setInterimText('')
          console.log('[speech] flush → "', text.slice(0, 60), '"')
          if (text) { appendTranscript('user', text); sendMessageToAgent(text) }
        }, SUBMIT_DEBOUNCE_MS)
      }
    }

    rec.onerror = (e) => {
      if (gen !== recognitionGenerationRef.current) return  // stale session
      console.error('[speech] error:', e.error)
      speechErrorRef.current = e.error
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isRecognitionActiveRef.current = false
        recognitionRef.current = null
        setMicOn(false)
        setSpeechBlocked(true)
        setStatus('mic blocked — use text input')
      }
    }

    if(pttActive) return; // Don't auto-start if Push-to-Talk is active — wait for user to click
    console.log('[speech] starting — gen:', gen)
    isRecognitionActiveRef.current = true
    recognitionRef.current = rec
    rec.start()
    setMicOn(true)
   //
  }

  // Halts the recognition engine immediately, discarding any buffered audio.
  // Increments the generation counter to invalidate all in-flight handlers.
  // Gate (ignoreRecognitionRef) is closed here and reopened only in rec.onstart
  // of the next fresh session — preventing late post-abort results from leaking.
  function _haltRecognitionEngine() {
    clearTimeout(debounceTimerRef.current)
    pendingTextRef.current    = ''
    latestInterimRef.current  = ''
    speechErrorRef.current    = null
    isRecognitionActiveRef.current = false
    ignoreRecognitionRef.current   = true
    recognitionGenerationRef.current++    // invalidate all existing handler closures
    setInterimText('')
    if (recognitionRef.current) {
      const rec = recognitionRef.current
      recognitionRef.current = null
      rec.onstart = rec.onresult = rec.onerror = rec.onend = null
      console.log('[speech] halting engine — gate closed, gen now:', recognitionGenerationRef.current)
      try {
        // abort() discards buffered audio immediately; stop() would finalise it
        // and fire one last onresult with whatever was in the pipeline.
        if (typeof rec.abort === 'function') rec.abort()
        else rec.stop()
      } catch (_) {}
    }
  }

  function stopMicRecognition() {
    _haltRecognitionEngine()
    setMicOn(false)
  }

  // Interviewer turn — halt recognition WITHOUT changing micOn so it resumes
  // automatically when the interviewer finishes speaking.
  function pauseRecognition() {
    _haltRecognitionEngine()
  }

  function startPtt() {
    if (isAgentTalkingRef.current || awaitingAgentTurnRef.current || speechBlocked) return
    // Clear any leftover buffer so this PTT session starts clean
    clearTimeout(debounceTimerRef.current)
    pendingTextRef.current   = ''
    latestInterimRef.current = ''
    setInterimText('')
    pttActiveRef.current = true
    setPttActive(true)
    if (!isRecognitionActiveRef.current) startMicRecognition()
    setStatus('listening (PTT)')
  }

  function stopPttAndSubmit() {
    if (!pttActiveRef.current) return
    pttActiveRef.current = false
    setPttActive(false)
    // Capture before _haltRecognitionEngine clears the buffers
    const text = (pendingTextRef.current || latestInterimRef.current).trim()
    _haltRecognitionEngine()
    setMicOn(false)
    if (text) {
      appendTranscript('user', text)
      sendMessageToAgent(text)
    } else {
      if (sessionActiveRef.current) setStatus('Your turn…')
    }
  }

  // ── Transcript + session persistence ──────────────────────────────────────
  function appendTranscript(role, text) {
    setTranscriptLog(l => [...l, { role, text, ts: Date.now() }])
  }

  function saveMessageToSession(sessionId, role, content) {
    fetch(`/api/interview/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    }).catch(e => console.warn('[session] save message failed:', e))
  }

  // ── Agent conversation ────────────────────────────────────────────────────

  // Send a user message to the D-ID agent. The agent's reply arrives
  // asynchronously via handleAgentMessage (onNewMessage callback in the hook).
  // isResponding is cleared in the finally block after chat() resolves so the UI
  // never gets permanently stuck — agent speaking state is tracked via isAgentTalking.
  async function sendMessageToAgent(text) {
    if (!text.trim() || isRespondingRef.current) {
      console.log('[send] guard blocked — text empty:', !text.trim(), '| isResponding:', isRespondingRef.current)
      return
    }
    if (isAgentTalkingRef.current) {
      console.log('[send] blocked — agent speaking, discarding:', text.slice(0, 60))
      return
    }

    // Close the gate immediately and flag that we're waiting for the agent to speak.
    // agentChat() resolves as soon as D-ID acknowledges the request — well before the
    // agent starts speaking.  Without this, the mic restarts in that window and
    // captures the agent's own audio as user input.
    awaitingAgentTurnRef.current = true
    ignoreRecognitionRef.current = true
    clearTimeout(agentResponseTimeoutRef.current)
    // Safety valve: if the agent never fires Talking within 10s, release the gate
    // so the user isn't locked out indefinitely.
    agentResponseTimeoutRef.current = setTimeout(() => {
      console.warn('[send] agent response timeout — force-releasing mic gate')
      awaitingAgentTurnRef.current  = false
      ignoreRecognitionRef.current  = false
      if (sessionActiveRef.current && !isRecognitionActiveRef.current && !isAgentTalkingRef.current) {
        startMicRecognition()
      }
    }, 10000)

    isRespondingRef.current = true
    setIsResponding(true)
    setStatus('thinking...')
    setAvatarMessage('')
    console.log('[send] → agentChat | gate closed | text:', text.slice(0, 80))

    // Transcript already added by caller (speech flush or handleManualSend).
    if (sessionIdRef.current) {
      saveMessageToSession(sessionIdRef.current, 'user', text)
    }

    try {
      const result = await agentChat(text)
      console.log('[send] agentChat resolved — result:', result ? JSON.stringify(result).slice(0, 120) : result)
      if (!result) console.warn('[send] agentChat returned falsy — agent may not respond')
    } catch (e) {
      console.error('[send] agentChat threw:', e)
    } finally {
      // Unblock the responding guard so the next send can proceed.
      // Mic stays off (awaitingAgentTurnRef still true) — the turn-taking effect
      // will set status and restart mic once the agent actually starts speaking.
      isRespondingRef.current = false
      setIsResponding(false)
      console.log('[send] isResponding cleared; awaiting agent speech | gate still closed')
      if (sessionActiveRef.current && !awaitingAgentTurnRef.current) setStatus('listening')
    }
  }

  // Trigger the opening greeting after session start. Sends interview context
  // to the agent so it knows the role, difficulty, and persona to adopt.
  async function openingGreet(sessionId) {
    if (!sessionActiveRef.current) return

    // Same gate logic as sendMessageToAgent — keep mic off until agent actually speaks.
    awaitingAgentTurnRef.current = true
    ignoreRecognitionRef.current = true
    clearTimeout(agentResponseTimeoutRef.current)
    agentResponseTimeoutRef.current = setTimeout(() => {
      console.warn('[greet] agent response timeout — force-releasing mic gate')
      awaitingAgentTurnRef.current  = false
      ignoreRecognitionRef.current  = false
      if (sessionActiveRef.current && !isRecognitionActiveRef.current && !isAgentTalkingRef.current) {
        startMicRecognition()
      }
    }, 10000)

    isRespondingRef.current = true
    setIsResponding(true)
    setStatus('thinking...')

    const parts = [
      `Begin the interview. You are interviewing a candidate for a ${roleType} position.`,
      `Difficulty: ${difficulty}. Interviewer persona: ${persona}.`,
      jobDescription ? `Job description: ${jobDescription}` : null,
      resumeContext  ? `Candidate resume highlights: ${resumeContext}` : null,
    ].filter(Boolean)
    const context = parts.join(' ')
    console.log('[greet] sending opening context:', context.slice(0, 120))

    try {
      const result = await agentChat(context)
      console.log('[greet] agentChat resolved — result:', result ? JSON.stringify(result).slice(0, 120) : result)
    } catch (e) {
      console.error('[greet] agentChat threw:', e)
    } finally {
      isRespondingRef.current = false
      setIsResponding(false)
      console.log('[greet] isResponding cleared; opening reply expected via callback')
      if (sessionActiveRef.current) setStatus('listening')
    }
    void sessionId
  }

  // ── Session lifecycle ─────────────────────────────────────────────────────
  async function startSession() {
    setSessionActive(true)
    sessionActiveRef.current = true
    setStatus('starting...')
    setTranscriptLog([])
    setAvatarMessage('')
    setLastResult(null)
    // Mic MUST start before any await — Chrome only allows rec.start() in sync gesture stack.
    if (!speechBlocked) startMicRecognition()
    startCamera()
    // Unmute agent video now that we're inside a user gesture. The video starts
    // muted so Chrome's autoPlay policy allows pre-warm playback without a gesture.
    if (agentVideoRef.current) {
      agentVideoRef.current.muted = false
      console.log('[session] agent video unmuted')
    }
    // connectAgent() is a no-op if the pre-warm already connected.
    connectAgent().catch(console.warn)
    console.log('[session] start — awaiting session API + agent readiness in parallel')
    try {
      // Run the session creation API call and agent readiness in parallel.
      // openingGreet() must not fire until onSrcObjectReady has fired inside the
      // SDK — calling chat() before that throws "Streaming manager is not initialized".
      const [resp] = await Promise.all([
        fetch('/api/interview/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roleType, persona, difficulty,
            jobDescription: jobDescription || null,
            resumeContext:  resumeContext  || null,
          }),
        }),
        // Race agent readiness against a 15s timeout so a connection failure
        // doesn't block the session start path indefinitely.
        Promise.race([
          agentWhenReady(),
          new Promise(resolve => setTimeout(() => {
            console.warn('[session] agent readiness timeout — proceeding without confirmed ready')
            resolve()
          }, 15000)),
        ]),
      ])
      const data = await resp.json()
      sessionIdRef.current = data.sessionId
      console.log('[session] agent ready + session created — calling openingGreet')
      openingGreet(data.sessionId).catch(console.warn)
    } catch (e) {
      console.error('Failed to create session:', e)
    }
  }

  async function endSession() {
    const sid = sessionIdRef.current
    sessionActiveRef.current = false
    setSessionActive(false)
    pttActiveRef.current = false
    setPttActive(false)
    stopMicRecognition()
    stopCamera()
    setSpeechBlocked(false)
    setStatus('idle')
    disconnectAgent().catch(console.warn)
    sessionIdRef.current = null
    if (sid) {
      try {
        const endResp    = await fetch(`/api/interview/session/${sid}/end`, { method: 'POST' })
        const endedSession = await endResp.json()
        setLastResult(normalizeResult(endedSession.scorecard || tryParseResult(endedSession.finalSummary)))
        const listResp = await fetch('/api/interview/sessions')
        setPastSessions(await listResp.json())
      } catch (e) {
        console.error('Failed to end session:', e)
      }
    }
  }

  function handleManualSend() {
    const text = manualInput.trim()
    if (!text) return
    appendTranscript('user', text)
    sendMessageToAgent(text)
    setManualInput('')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const showLower  = sessionActive || transcriptLog.length > 0 || lastResult
  const showResult = lastResult && !sessionActive

  return (
    <div style={css.page}>

      {/* ── Header ── */}
      <header style={css.header}>
        <div style={css.headerLeft}>
          <span style={css.logo}>World Ready</span>
          <span style={css.logoSub}>AI Interview Training</span>
        </div>
        <div style={css.headerRight}>
          {sessionActive && <span style={css.livePill}>● LIVE</span>}
          <span style={css.statusPill}>
            <span style={{ ...css.dot, background: statusColor(status) }} />
            {status}
          </span>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div style={css.main}>

        {/* Left: avatar + controls */}
        <div style={css.leftCol}>
          <div style={css.avatarPanel}>
            {/* Agent video — always mounted so the SDK can assign srcObject at any time.
                muted allows Chrome autoPlay pre-session; unmuted inside startSession(). */}
            <video
              ref={agentVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                ...css.avatarVideo,
                display: (agentState === 'ready' || agentState === 'talking') ? 'block' : 'none',
              }}
              onLoadedMetadata={(e) => {
                const v = e.target
                console.log('[video] loadedMetadata — size:', v.videoWidth, 'x', v.videoHeight)
              }}
            />

            {/* Connecting state */}
            {agentState === 'connecting' && (
              <div style={css.avatarFallback}>
                <div style={css.avatarOrbGenerating}>📡</div>
                <p style={css.avatarSpeech}>Connecting live avatar…</p>
              </div>
            )}

            {/* Fallback: disconnected / error / connected-but-no-srcObject-yet */}
            {(agentState === 'disconnected' || agentState === 'error' || agentState === 'connected') && (
              <div style={css.avatarFallback}>
                <div style={isResponding ? css.avatarOrbGenerating : css.avatarOrb}>
                  {isResponding ? '💭' : '🤖'}
                </div>
                <p style={css.avatarSpeech}>
                  {isResponding
                    ? 'Generating response…'
                    : agentState === 'connected'
                      ? 'Avatar connected — will appear when speaking begins.'
                      : avatarMessage
                        ? avatarMessage
                        : sessionActive
                          ? 'Listening… speak or type to continue.'
                          : 'Configure your session below and click Start to begin.'}
                </p>
              </div>
            )}

            <div style={{
              ...css.panelTag,
              ...(agentState === 'ready' || agentState === 'talking'
                ? { color: '#22c55e', background: 'rgba(34,197,94,0.06)' }
                : agentState === 'connected'
                  ? { color: '#06b6d4', background: 'rgba(6,182,212,0.06)' }
                  : agentState === 'connecting'
                    ? { color: '#f59e0b', background: 'rgba(245,158,11,0.06)' }
                    : {}),
            }}>
              {agentState === 'connecting'
                ? '● Connecting'
                : agentState === 'connected'
                  ? '● Connected'
                  : agentState === 'talking'
                    ? '● Speaking'
                    : agentState === 'ready' && !sessionActive
                      ? '● Ready'
                      : agentState === 'ready'
                        ? '● Live'
                        : isResponding
                          ? 'Thinking'
                          : 'AI Interviewer'}
            </div>
          </div>

          <div style={css.controlsCard}>
            <div style={css.btnRow}>
              <button style={toggleBtn(cameraOn)} onClick={() => cameraOn ? stopCamera() : startCamera()}>
                {cameraOn ? '📷 On' : '📷 Off'}
              </button>
              {speechBlocked ? (
                <button style={blockedBtn()} title="Grant mic access in browser settings" onClick={() => setSpeechBlocked(false)}>
                  🎤 Blocked
                </button>
              ) : (
                <button style={toggleBtn(micOn)} onClick={() => micOn ? stopMicRecognition() : startMicRecognition()}>
                  {micOn ? '🎤 On' : '🎤 Off'}
                </button>
              )}
            </div>
            {sessionActive && (
              <div style={css.btnRow}>
                <button
                  style={pttBtn(pttActive, isAgentTurn || speechBlocked)}
                  disabled={isAgentTurn || speechBlocked}
                  onClick={() => pttActive ? stopPttAndSubmit() : startPtt()}
                >
                  {pttActive ? '⏹ Stop Speaking' : '🎙 Push to Speak'}
                </button>
              </div>
            )}
            <div style={css.btnRow}>
              <button style={sessionBtn('#16a34a', sessionActive)} disabled={sessionActive} onClick={startSession}>
                Start Session
              </button>
              <button style={sessionBtn('#dc2626', !sessionActive)} disabled={!sessionActive} onClick={endSession}>
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar: self-view + setup */}
        <div style={css.rightSidebar}>
          <div style={css.selfViewCard}>
            <video ref={localVideoRef} autoPlay muted playsInline style={css.selfVideo} />
            <div style={css.panelTag}>You</div>
          </div>

          {!sessionActive ? (
            <div style={css.setupCard}>
              <div style={css.sectionLabel}>Interview Setup</div>
              <div style={css.setupRow}>
                <select style={css.select} value={roleType} onChange={e => setRoleType(e.target.value)}>
                  <option>Software Engineer</option>
                  <option>Backend Engineer</option>
                  <option>Frontend Engineer</option>
                  <option>Full Stack Engineer</option>
                  <option>Product Manager</option>
                  <option>Data Scientist</option>
                  <option>DevOps / Platform Engineer</option>
                  <option>Engineering Manager</option>
                </select>
                <select style={{ ...css.select, maxWidth: 90 }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <select style={{ ...css.select, width: '100%', marginBottom: 8 }} value={persona} onChange={e => setPersona(e.target.value)}>
                <option>US Startup Recruiter</option>
                <option>UK Finance Interviewer</option>
                <option>Japanese Corporate Interviewer</option>
                <option>Indian Technical Interviewer</option>
                <option>German Engineering Firm</option>
              </select>
              <textarea style={css.textarea} placeholder="Optional: paste a job description…" value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={2} />
              <textarea style={{ ...css.textarea, marginTop: 6 }} placeholder="Optional: paste resume highlights…" value={resumeContext} onChange={e => setResumeContext(e.target.value)} rows={3} />
            </div>
          ) : (
            <div style={css.sessionBadge}>
              <span style={css.badgeDot} />
              <div style={css.badgeText}>
                <span style={css.badgeRole}>{roleType}</span>
                <span style={css.badgeMeta}>{difficulty} · {persona}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Lower: conversation + result ── */}
      {showLower && (
        <div style={{ ...css.lower, gridTemplateColumns: showResult ? '1fr 360px' : '1fr' }}>

          {/* Conversation transcript */}
          <div style={css.transcriptCard}>
            <div style={css.transcriptHead}>
              <span style={css.sectionLabel}>Conversation</span>
              {isResponding && <span style={css.thinkingBadge}>thinking…</span>}
            </div>
            <div style={css.transcriptList}>
              {transcriptLog.length === 0 && (
                <span style={css.emptyNote}>No messages yet. Start speaking or type below.</span>
              )}
              {transcriptLog.map((t, i) => (
                <div key={i} style={msgBubble(t.role)}>
                  <span style={speakerLabel(t.role)}>{t.role === 'user' ? 'You' : 'Interviewer'}</span>
                  {t.text}
                </div>
              ))}
              {interimText && (
                <div style={css.interimBubble}>
                  <span style={{ color: '#334155', marginRight: 6 }}>You</span>
                  <span style={{ color: '#475569', fontStyle: 'italic' }}>{interimText}</span>
                </div>
              )}
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
              <button
                style={{ ...css.sendBtn, opacity: isResponding ? 0.4 : 1, cursor: isResponding ? 'not-allowed' : 'pointer' }}
                disabled={isResponding}
                onClick={handleManualSend}
              >
                {isResponding ? '…' : 'Send'}
              </button>
            </div>
          </div>

          {/* Scorecard */}
          {showResult && (
            <div style={css.resultCard}>
              <div style={css.resultHead}>
                <span style={css.sectionLabel}>Interview Scorecard</span>
                {lastResult.overallScore != null && (
                  <div style={overallChip(lastResult.overallScore)}>
                    {lastResult.overallScore}
                    <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5 }}>/100</span>
                  </div>
                )}
              </div>

              {lastResult.feedbackSummary && (
                <p style={css.resultSummary}>{lastResult.feedbackSummary}</p>
              )}

              <div style={css.scoreRows}>
                {[
                  ['Clarity',       lastResult.clarityScore],
                  ['Confidence',    lastResult.confidenceScore],
                  ['Answer Depth',  lastResult.answerDepthScore],
                  ['Follow-Up',     lastResult.followUpHandlingScore],
                  ['Communication', lastResult.communicationQualityScore],
                ].filter(([, v]) => v != null).map(([label, score]) => (
                  <ScoreRow key={label} label={label} score={score} />
                ))}
                {lastResult.fillerWordCount != null && (
                  <div style={css.scoreRow}>
                    <span style={css.scoreLabel}>Filler Words</span>
                    <div style={css.scoreBarTrack} />
                    <span style={{ ...css.scoreValue, color: lastResult.fillerWordCount <= 3 ? '#22c55e' : lastResult.fillerWordCount <= 8 ? '#f59e0b' : '#ef4444' }}>
                      {lastResult.fillerWordCount} detected
                    </span>
                  </div>
                )}
              </div>

              {lastResult.strengths?.length > 0 && (
                <div style={css.resultBlock}>
                  <div style={css.resultBlockLabel}>Strengths</div>
                  {lastResult.strengths.map((s, i) => (
                    <div key={i} style={css.resultBullet}>
                      <span style={{ color: '#22c55e', marginRight: 7, flexShrink: 0 }}>✓</span>{s}
                    </div>
                  ))}
                </div>
              )}

              {lastResult.areasToImprove?.length > 0 && (
                <div style={css.resultBlock}>
                  <div style={css.resultBlockLabel}>Areas to Improve</div>
                  {lastResult.areasToImprove.map((s, i) => (
                    <div key={i} style={css.resultBullet}>
                      <span style={{ color: '#f59e0b', marginRight: 7, flexShrink: 0 }}>→</span>{s}
                    </div>
                  ))}
                </div>
              )}

              {lastResult.suggestedFocus && (
                <div style={css.resultFocus}>
                  <span style={css.focusLabel}>Next Focus </span>
                  {lastResult.suggestedFocus}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Past sessions ── */}
      {pastSessions.length > 0 && (
        <div style={css.historySection}>
          <button style={css.historyToggle} onClick={() => setShowHistory(h => !h)}>
            <span style={{ color: '#475569' }}>Past Sessions</span>
            <span style={css.historyCount}>{pastSessions.length}</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#334155' }}>{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && (
            <div style={css.historyList}>
              {pastSessions.map(s => {
                const r      = normalizeResult(s.scorecard || tryParseResult(s.finalSummary))
                const isOpen = expandedSession === s.sessionId
                return (
                  <div key={s.sessionId} style={css.historyItem}>
                    <div style={css.historyItemRow} onClick={() => setExpandedSession(isOpen ? null : s.sessionId)}>
                      <div>
                        <div style={css.historyRole}>{s.roleType}</div>
                        <div style={css.historyMeta}>{s.difficulty} · {s.persona}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r?.overallScore != null && <span style={css.historyScore}>{r.overallScore}/100</span>}
                        <span style={css.historyDate}>{new Date(s.startedAt).toLocaleDateString()}</span>
                        <span style={{ fontSize: 9, color: '#334155' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={css.historyDetail}>
                        {r?.feedbackSummary && <p style={css.historySummaryText}>{r.feedbackSummary}</p>}
                        {r?.strengths?.length > 0 && (
                          <div style={css.historyTagRow}>
                            <span style={css.historyTagLabel}>Strengths</span>
                            {r.strengths.map((x, i) => <span key={i} style={css.tagGreen}>{x}</span>)}
                          </div>
                        )}
                        {r?.areasToImprove?.length > 0 && (
                          <div style={css.historyTagRow}>
                            <span style={css.historyTagLabel}>Improve</span>
                            {r.areasToImprove.map((x, i) => <span key={i} style={css.tagAmber}>{x}</span>)}
                          </div>
                        )}
                        {!r && s.messages?.length > 0 && (
                          <div style={css.miniTranscript}>
                            {s.messages.slice(0, 5).map((m, i) => (
                              <div key={i} style={miniMsg(m.sender)}>
                                <span style={speakerLabel(m.sender === 'user' ? 'user' : 'interviewer')}>
                                  {m.sender === 'user' ? 'You' : 'Interviewer'}{' '}
                                </span>
                                {m.text}
                              </div>
                            ))}
                            {s.messages.length > 5 && <span style={css.moreMsg}>+{s.messages.length - 5} more</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={css.footer}>
        <span>Session: {sessionActive ? <span style={{ color: '#22c55e' }}>Active</span> : 'Inactive'}</span>
        <span style={css.sep}>·</span>
        <span>Mic: {micOn ? 'On' : 'Off'}</span>
        <span style={css.sep}>·</span>
        <span>Camera: {cameraOn ? 'On' : 'Off'}</span>
      </footer>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tryParseResult(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return { feedbackSummary: str } }
}

function normalizeResult(r) {
  if (!r) return null
  const gradeMap = { A: 90, B: 75, C: 60, D: 45 }
  return {
    overallScore:              r.overallScore ?? (r.score ? (gradeMap[r.score] ?? null) : null),
    feedbackSummary:           r.feedbackSummary || r.summary || null,
    strengths:                 r.strengths || [],
    areasToImprove:            r.areasToImprove || r.improvements || [],
    suggestedFocus:            r.suggestedFocus || null,
    clarityScore:              r.clarityScore              ?? null,
    confidenceScore:           r.confidenceScore           ?? null,
    answerDepthScore:          r.answerDepthScore          ?? null,
    followUpHandlingScore:     r.followUpHandlingScore     ?? null,
    communicationQualityScore: r.communicationQualityScore ?? null,
    fillerWordCount:           r.fillerWordCount           ?? null,
  }
}

function ScoreRow({ label, score }) {
  const pct   = Math.round((score / 10) * 100)
  const color = scoreColor(score)
  return (
    <div style={css.scoreRow}>
      <span style={css.scoreLabel}>{label}</span>
      <div style={css.scoreBarTrack}>
        <div style={{ ...css.scoreBarFill, width: pct + '%', background: color }} />
      </div>
      <span style={{ ...css.scoreValue, color }}>{score}/10</span>
    </div>
  )
}

function scoreColor(score) {
  if (score >= 8) return '#22c55e'
  if (score >= 6) return '#f59e0b'
  return '#ef4444'
}

function overallChip(score) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444'
  return {
    display: 'flex', alignItems: 'baseline', gap: 3,
    fontSize: 26, fontWeight: 800, color,
    background: color + '12', padding: '3px 14px',
    borderRadius: 10, border: `1px solid ${color}28`, lineHeight: 1.3
  }
}

function statusColor(s) {
  if (s === 'listening')               return '#22c55e'
  if (s === 'Your turn…')              return '#4ade80'
  if (s === 'finishing...')            return '#86efac'
  if (s === 'thinking...' || s === 'sending') return '#f59e0b'
  if (s === 'Interviewer speaking…')   return '#818cf8'
  if (s === 'error' || s.includes('blocked')) return '#ef4444'
  if (s === 'playing')                 return '#3b82f6'
  return '#475569'
}

function toggleBtn(active) {
  return {
    flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
    background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
    color: active ? '#93c5fd' : '#475569'
  }
}

function blockedBtn() {
  return {
    flex: 1, padding: '8px 0', borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
    background: 'rgba(239,68,68,0.06)', color: '#f87171'
  }
}

function pttBtn(active, disabled) {
  if (disabled) return {
    flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
    cursor: 'not-allowed', fontSize: 12, fontWeight: 500,
    background: 'rgba(255,255,255,0.03)', color: '#1e293b'
  }
  if (active) return {
    flex: 1, padding: '8px 0', borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer',
    fontSize: 12, fontWeight: 600,
    background: 'rgba(239,68,68,0.14)', color: '#f87171'
  }
  return {
    flex: 1, padding: '8px 0', borderRadius: 6,
    border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
    background: 'rgba(34,197,94,0.08)', color: '#4ade80'
  }
}

function sessionBtn(color, isDisabled) {
  return {
    flex: 1, padding: '9px 0', borderRadius: 6, border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontSize: 13, fontWeight: 600,
    background: isDisabled ? 'rgba(255,255,255,0.03)' : color,
    color: isDisabled ? '#1e293b' : '#fff'
  }
}

function msgBubble(who) {
  return {
    padding: '7px 10px', borderRadius: 7, fontSize: 13, lineHeight: 1.6,
    background: who === 'user' ? 'rgba(37,99,235,0.09)' : 'rgba(99,102,241,0.09)'
  }
}

function speakerLabel(who) {
  return {
    fontSize: 11, fontWeight: 700, letterSpacing: 0.3, marginRight: 7,
    color: who === 'user' ? '#3b82f6' : '#818cf8'
  }
}

function miniMsg(sender) {
  return {
    padding: '4px 8px', borderRadius: 4, fontSize: 12, lineHeight: 1.5,
    background: sender === 'user' ? 'rgba(37,99,235,0.06)' : 'rgba(99,102,241,0.06)'
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const css = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    background: '#080f1c', color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13
  },

  // Header
  header: {
    padding: '11px 20px', background: '#050c18',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, position: 'sticky', top: 0, zIndex: 10
  },
  headerLeft:  { display: 'flex', alignItems: 'baseline', gap: 10 },
  logo:        { fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.2 },
  logoSub:     { fontSize: 12, color: '#1e3a5f' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  livePill: {
    fontSize: 11, fontWeight: 600, color: '#22c55e',
    background: 'rgba(34,197,94,0.08)', padding: '3px 8px',
    borderRadius: 12, border: '1px solid rgba(34,197,94,0.18)'
  },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 12, padding: '4px 10px', borderRadius: 16,
    background: 'rgba(255,255,255,0.04)', color: '#64748b'
  },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },

  // Main grid
  main: {
    display: 'grid', gridTemplateColumns: '1fr 285px',
    gap: 14, padding: '14px 16px 0',
    minHeight: 400
  },

  // Left column
  leftCol: { display: 'flex', flexDirection: 'column', gap: 10 },
  avatarPanel: {
    flex: '1 1 auto', minHeight: 300,
    background: '#04090f', borderRadius: 12, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  avatarVideo:    { flex: 1, width: '100%', objectFit: 'cover', display: 'block' },
  avatarFallback: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 20, padding: '32px 40px', textAlign: 'center'
  },
  avatarOrb: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, boxShadow: '0 0 56px rgba(99,102,241,0.2)'
  },
  avatarOrbGenerating: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f2d6b 0%, #3b1d7a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, boxShadow: '0 0 32px rgba(99,102,241,0.1)', opacity: 0.6
  },
  avatarSpeech: {
    fontSize: 15, lineHeight: 1.8, color: '#334155',
    maxWidth: 440, margin: 0
  },
  panelTag: {
    padding: '6px 14px', fontSize: 10, fontWeight: 700,
    color: '#0f2744', background: '#020810',
    letterSpacing: 0.8, textTransform: 'uppercase', flexShrink: 0
  },
  controlsCard: {
    background: '#0b1525', borderRadius: 10, padding: '12px 12px 4px',
    border: '1px solid rgba(255,255,255,0.04)', flexShrink: 0
  },

  // Right sidebar
  rightSidebar: { display: 'flex', flexDirection: 'column', gap: 10 },
  selfViewCard: {
    background: '#04090f', borderRadius: 10, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)', flexShrink: 0
  },
  selfVideo: {
    width: '100%', aspectRatio: '4/3',
    objectFit: 'cover', display: 'block', background: '#020810'
  },
  setupCard: {
    background: '#0b1525', borderRadius: 10, padding: '12px 12px',
    border: '1px solid rgba(255,255,255,0.04)', flex: 1
  },
  sessionBadge: {
    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
    background: '#0b1525', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.04)'
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#22c55e', flexShrink: 0, marginTop: 3
  },
  badgeText: { display: 'flex', flexDirection: 'column', gap: 2 },
  badgeRole: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  badgeMeta: { fontSize: 11, color: '#334155' },

  // Lower section
  lower: {
    display: 'grid', gap: 14,
    padding: '12px 16px', maxHeight: 440, minHeight: 230
  },
  transcriptCard: {
    background: '#0b1525', borderRadius: 10, padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  transcriptHead: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8, flexShrink: 0
  },
  thinkingBadge: {
    fontSize: 11, color: '#f59e0b',
    background: 'rgba(245,158,11,0.08)', padding: '2px 8px', borderRadius: 10
  },
  transcriptList: {
    flex: '1 1 auto', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10
  },
  emptyNote:    { fontSize: 12, color: '#1e293b', textAlign: 'center', padding: '12px 0' },
  interimBubble: {
    padding: '5px 10px', borderRadius: 6, fontSize: 13, lineHeight: 1.5,
    background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.04)'
  },
  inputRow:  { display: 'flex', gap: 6, flexShrink: 0 },
  textInput: {
    flex: 1, padding: '8px 10px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: 13, outline: 'none'
  },
  sendBtn: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1d4ed8', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer'
  },

  // Score rows
  scoreRows:     { display: 'flex', flexDirection: 'column', gap: 8 },
  scoreRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  scoreLabel:    { fontSize: 12, color: '#475569', width: 112, flexShrink: 0 },
  scoreBarTrack: {
    flex: 1, height: 4, borderRadius: 4,
    background: 'rgba(255,255,255,0.06)', overflow: 'hidden'
  },
  scoreBarFill:  { height: '100%', borderRadius: 4 },
  scoreValue:    { fontSize: 12, fontWeight: 600, width: 64, textAlign: 'right', flexShrink: 0 },

  // Result card
  resultCard: {
    background: '#0b1525', borderRadius: 10, padding: '14px 16px',
    border: '1px solid rgba(99,102,241,0.14)',
    display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto'
  },
  resultHead: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexShrink: 0
  },
  scoreChip: {
    fontSize: 18, fontWeight: 800, color: '#a78bfa',
    background: 'rgba(99,102,241,0.1)', padding: '2px 14px',
    borderRadius: 8, border: '1px solid rgba(99,102,241,0.18)'
  },
  resultSummary: {
    fontSize: 13, lineHeight: 1.75, color: '#64748b', margin: 0,
    padding: '10px 12px', borderRadius: 7,
    background: 'rgba(255,255,255,0.02)'
  },
  resultBlock:      { display: 'flex', flexDirection: 'column', gap: 6 },
  resultBlockLabel: {
    fontSize: 10, fontWeight: 700, color: '#334155',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2
  },
  resultBullet: {
    fontSize: 13, color: '#94a3b8', lineHeight: 1.55,
    display: 'flex', alignItems: 'flex-start'
  },
  resultFocus: {
    fontSize: 13, color: '#94a3b8', lineHeight: 1.6,
    padding: '9px 12px', borderRadius: 7,
    background: 'rgba(99,102,241,0.05)',
    border: '1px solid rgba(99,102,241,0.1)'
  },
  focusLabel: { fontWeight: 700, color: '#6366f1', marginRight: 5 },

  // History
  historySection: { borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 },
  historyToggle:  {
    width: '100%', padding: '9px 20px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left'
  },
  historyCount: {
    fontSize: 10, padding: '1px 6px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', color: '#475569'
  },
  historyList: {
    padding: '0 16px 12px', maxHeight: 300, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 6
  },
  historyItem: {
    borderRadius: 8, overflow: 'hidden',
    background: '#060d18', border: '1px solid rgba(255,255,255,0.04)'
  },
  historyItemRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '9px 12px',
    cursor: 'pointer', userSelect: 'none'
  },
  historyRole: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  historyMeta: { fontSize: 11, color: '#334155', marginTop: 2 },
  historyScore: {
    fontSize: 13, fontWeight: 700, color: '#a78bfa',
    background: 'rgba(99,102,241,0.08)', padding: '1px 8px', borderRadius: 5
  },
  historyDate:   { fontSize: 11, color: '#1e293b' },
  historyDetail: {
    padding: '0 12px 12px',
    display: 'flex', flexDirection: 'column', gap: 8
  },
  historySummaryText: {
    fontSize: 12, lineHeight: 1.65, color: '#475569', margin: 0
  },
  historyTagRow: { display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' },
  historyTagLabel: {
    fontSize: 10, fontWeight: 700, color: '#334155',
    textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 52, paddingTop: 3
  },
  tagGreen: {
    fontSize: 11, padding: '2px 8px', borderRadius: 4,
    background: 'rgba(34,197,94,0.07)', color: '#4ade80'
  },
  tagAmber: {
    fontSize: 11, padding: '2px 8px', borderRadius: 4,
    background: 'rgba(245,158,11,0.07)', color: '#fbbf24'
  },
  miniTranscript: { display: 'flex', flexDirection: 'column', gap: 4 },
  moreMsg:        { fontSize: 11, color: '#334155', textAlign: 'center', paddingTop: 4 },

  // Shared
  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: '#334155',
    textTransform: 'uppercase', letterSpacing: 0.8
  },
  setupRow: { display: 'flex', gap: 8, marginBottom: 8 },
  select: {
    flex: 1, padding: '7px 8px', borderRadius: 6, fontSize: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', outline: 'none'
  },
  textarea: {
    width: '100%', padding: '7px 8px', borderRadius: 6, fontSize: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)', color: '#e2e8f0',
    resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
  },
  btnRow: { display: 'flex', gap: 8, marginBottom: 8 },

  // Footer
  footer: {
    height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#030810', borderTop: '1px solid rgba(255,255,255,0.03)',
    fontSize: 11, color: '#1e293b', flexShrink: 0
  },
  sep: { margin: '0 10px' }
}
