import { useCallback, useEffect, useRef, useState } from 'react'

const API = '/api/did/stream'

/**
 * Manages one D-ID Talks Streams WebRTC session.
 *
 * Guarantees:
 *   - Only one stream is ever created at a time (connectingRef guard)
 *   - Any stale stream is explicitly closed before a new one is created
 *   - Cleanup fires on unmount AND on page unload (keepalive:true)
 *   - Strict Mode safe: the hook's own state prevents duplicate connects
 *
 * States: disconnected → connecting → live → speaking → live → ...
 *         Any failure  → error  (caller falls back to TTS / generated video)
 */
export function useDidStream() {
  const [streamState, setStreamStateValue] = useState('disconnected')
  const streamStateRef = useRef('disconnected')

  const streamIdRef   = useRef(null)
  const pcRef         = useRef(null)
  const speakTimerRef = useRef(null)
  const videoRef      = useRef(null)

  // Prevents overlapping connect() calls regardless of state timing.
  // Must be cleared in every exit path (success, failure, cancel).
  const connectingRef = useRef(false)

  function setState(s) {
    streamStateRef.current = s
    setStreamStateValue(s)
  }

  // ── Unmount cleanup ───────────────────────────────────────────────────────
  // keepalive:true keeps the DELETE in-flight even if the page is closing.
  useEffect(() => () => {
    clearTimeout(speakTimerRef.current)
    connectingRef.current = false
    const sid = streamIdRef.current
    streamIdRef.current = null
    if (sid) {
      console.log('[stream] unmount cleanup — closing', sid)
      fetch(`${API}/${sid}`, { method: 'DELETE', keepalive: true }).catch(() => {})
    }
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
  }, [])

  // ── connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    // Guard: one connect at a time
    if (connectingRef.current) {
      console.log('[stream] guard — connect already in progress, skipping duplicate')
      return false
    }
    const cur = streamStateRef.current
    if (cur === 'live' || cur === 'speaking') {
      console.log('[stream] guard — already', cur, ', skipping duplicate connect')
      return false
    }

    connectingRef.current = true

    // Close any stale stream before creating a new one
    const staleId = streamIdRef.current
    if (staleId) {
      console.log('[stream] closing stale stream', staleId, 'before reconnect')
      streamIdRef.current = null
      await fetch(`${API}/${staleId}`, { method: 'DELETE' })
        .then(r => console.log('[stream] stale close', r.ok ? 'ok' : 'failed'))
        .catch(e => console.warn('[stream] stale close error:', e))
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
    }

    setState('connecting')
    console.log('[stream] requesting new stream from backend...')

    try {
      const resp = await fetch(`${API}/start`, { method: 'POST' })
      const data = await resp.json()
      console.log('[stream] start response — available:', data.available, '  streamId:', data.streamId)

      if (!data.available) {
        console.log('[stream] D-ID not configured — falling back to disconnected')
        setState('disconnected')
        connectingRef.current = false
        return false
      }

      // If disconnect() was called while we were awaiting the backend, clean up
      // the stream we just created and bail.
      if (!connectingRef.current) {
        console.log('[stream] connect cancelled after stream created — deleting', data.streamId)
        fetch(`${API}/${data.streamId}`, { method: 'DELETE' }).catch(() => {})
        return false
      }

      streamIdRef.current = data.streamId
      console.log('[stream] stream id set:', data.streamId)

      const iceServers = Array.isArray(data.iceServers) && data.iceServers.length > 0
        ? data.iceServers
        : [{ urls: 'stun:stun.l.google.com:19302' }]

      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc

      pc.ontrack = (event) => {
        console.log('[stream] ontrack fired — streams:', event.streams?.length,
          'track kind:', event.track?.kind, 'readyState:', event.track?.readyState,
          'muted:', event.track?.muted)
        event.streams?.[0]?.getTracks().forEach(t => {
          console.log(`[stream] track: kind=${t.kind} readyState=${t.readyState} muted=${t.muted} id=${t.id}`)
        })

        const stream = event.streams?.[0]
        const vid = videoRef.current

        if (!stream) {
          console.warn('[stream] ontrack: event.streams[0] undefined — cannot attach')
          return
        }
        if (!vid) {
          console.warn('[stream] ontrack: videoRef.current is null — video element not mounted')
          return
        }

        vid.srcObject = stream
        console.log('[stream] srcObject assigned')
        console.log('[stream] video snapshot — readyState:', vid.readyState,
          'paused:', vid.paused, 'currentTime:', vid.currentTime.toFixed(3),
          'size:', vid.videoWidth, 'x', vid.videoHeight)

        vid.oncanplay = () => console.log('[video] canplay — readyState:', vid.readyState,
          'size:', vid.videoWidth, 'x', vid.videoHeight)
        vid.onplaying = () => console.log('[video] playing — currentTime:', vid.currentTime.toFixed(3),
          'size:', vid.videoWidth, 'x', vid.videoHeight)
        vid.onpause = () => console.log('[video] paused — currentTime:', vid.currentTime.toFixed(3))
        vid.onerror = () => console.error('[video] error event:', vid.error?.code, vid.error?.message)

        vid.onloadedmetadata = () => {
          console.log('[video] loadedmetadata — size:', vid.videoWidth, 'x', vid.videoHeight,
            'readyState:', vid.readyState)
          vid.play().catch(e => console.warn('[video] play() post-metadata rejected:', e.name))
        }

        // WebRTC media attached; transition to 'connected'.
        // 'live' requires confirmed video frames — D-ID may not send idle frames (scenario D).
        setState('connected')

        vid.play()
          .then(() => console.log('[video] play() resolved'))
          .catch(e => console.warn('[video] play() rejected:', e.name, e.message))

        // 10-second diagnostic interval: detect whether frames are actually flowing
        let diagCount = 0
        const diagInterval = setInterval(() => {
          diagCount++
          const v = videoRef.current
          if (!v) { clearInterval(diagInterval); return }
          console.log(`[video] diag [${diagCount}s] ct:${v.currentTime.toFixed(3)} rs:${v.readyState} paused:${v.paused} ${v.videoWidth}x${v.videoHeight}`)
          if (diagCount >= 10) {
            clearInterval(diagInterval)
            if (streamStateRef.current === 'connected') {
              console.warn('[stream] SCENARIO D: no frames in 10s — D-ID only sends frames during active speech')
            }
          }
        }, 1000)

        // Set 'live' only when the first actual video frame is confirmed
        function onFirstFrame() {
          clearInterval(diagInterval)
          const v = videoRef.current
          console.log('[stream] first frame confirmed — ct:', v?.currentTime?.toFixed(3),
            'size:', v?.videoWidth, 'x', v?.videoHeight)
          const s = streamStateRef.current
          if (s === 'connected' || s === 'connecting') setState('live')
        }

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
          console.log('[stream] frame detection: requestVideoFrameCallback')
          vid.requestVideoFrameCallback(onFirstFrame)
        } else {
          console.log('[stream] frame detection: timeupdate fallback')
          const onTimeUpdate = () => {
            const v = videoRef.current
            if (v && v.currentTime > 0) {
              v.removeEventListener('timeupdate', onTimeUpdate)
              onFirstFrame()
            }
          }
          vid.addEventListener('timeupdate', onTimeUpdate)
        }
      }

      pc.onicecandidate = ({ candidate }) => {
        if (!candidate || !streamIdRef.current) return
        fetch(`${API}/${streamIdRef.current}/ice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          }),
        }).catch(() => {})
      }

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState
        console.log('[stream] WebRTC connectionState:', s)
        // Do NOT set live here — wait for ontrack + loadedmetadata instead.
        // Setting live before srcObject is assigned causes a blank video panel.
        if (s === 'failed' || s === 'closed') {
          console.warn('[stream] WebRTC', s)
          setState('error')
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      await fetch(`${API}/${streamIdRef.current}/sdp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })

      console.log('[stream] SDP handshake complete — waiting for video track...')
      connectingRef.current = false
      return true
    } catch (e) {
      console.error('[stream] connect error:', e)
      setState('error')
      connectingRef.current = false
      return false
    }
  }, [])

  // ── speak ─────────────────────────────────────────────────────────────────
  const speak = useCallback(async (text) => {
    const s = streamStateRef.current
    if (!streamIdRef.current || s === 'disconnected' || s === 'error' || s === 'connecting') {
      console.log('[stream] speak skipped — state:', s, ' streamId:', streamIdRef.current)
      return false
    }

    clearTimeout(speakTimerRef.current)
    setState('speaking')

    try {
      await fetch(`${API}/${streamIdRef.current}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const ms = Math.max(text.split(/\s+/).length * 250 + 1500, 3000)
      speakTimerRef.current = setTimeout(() => setState('live'), ms)
      return true
    } catch (e) {
      console.error('[stream] speak failed:', e)
      setState('live')
      return false
    }
  }, [])

  // ── disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    clearTimeout(speakTimerRef.current)
    connectingRef.current = false // cancel any in-flight connect
    const sid = streamIdRef.current
    streamIdRef.current = null
    console.log('[stream] disconnect requested — stream:', sid)

    if (sid) {
      const ok = await fetch(`${API}/${sid}`, { method: 'DELETE' })
        .then(r => r.ok)
        .catch(() => false)
      console.log('[stream] disconnect', ok ? 'succeeded' : 'failed', 'for stream', sid)
    }

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null

    setState('disconnected')
  }, [])

  return { streamState, streamStateRef, videoRef, connect, speak, disconnect }
}
