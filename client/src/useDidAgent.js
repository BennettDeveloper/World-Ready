import { useCallback, useEffect, useRef, useState } from 'react'
import { createAgentManager, AgentActivityState, ConnectionState } from '@d-id/client-sdk'

/**
 * Manages a D-ID Agent Manager session using @d-id/client-sdk.
 *
 * States: disconnected → connecting → connected → ready → talking → ready → ...
 *         Any failure → error
 *
 * - 'connected'  WebRTC connected but srcObject not yet delivered
 * - 'ready'      srcObject received; streaming manager initialized; chat() is safe
 * - 'talking'    AgentActivityState.Talking
 *
 * READINESS CONTRACT
 * ------------------
 * manager.connect() resolves when WebRTC connects (onConnectionStateChange=Connected).
 * The streaming manager is NOT initialized until onSrcObjectReady fires — which can
 * be several seconds later.  Calling chat() before that throws "Streaming manager is
 * not initialized".
 *
 * Use whenReady() to await the 'ready' state before calling chat():
 *   await connectAgent()
 *   await whenReady()   // ← wait for onSrcObjectReady
 *   chat(text)
 *
 * @param {Object} options
 * @param {Function} options.onAgentMessage  Called with agent reply text (type='answer')
 */
export function useDidAgent({ onAgentMessage } = {}) {
  const [agentState, setAgentStateValue] = useState('disconnected')
  const agentStateRef = useRef('disconnected')
  const [agentActivity, setAgentActivity] = useState(AgentActivityState.Idle)

  const managerRef        = useRef(null)
  const videoRef          = useRef(null)
  const connectingRef     = useRef(false)
  const bootstrapRef      = useRef(null)
  const isAgentTalkingRef = useRef(false)
  // Queue of resolve functions waiting for agentState → 'ready'
  const readyWaitersRef   = useRef([])

  const onAgentMessageRef = useRef(onAgentMessage)
  useEffect(() => { onAgentMessageRef.current = onAgentMessage }, [onAgentMessage])

  function setState(s) {
    agentStateRef.current = s
    setAgentStateValue(s)
  }

  async function fetchBootstrap() {
    if (bootstrapRef.current) return bootstrapRef.current
    const resp = await fetch('/api/did/agent/bootstrap')
    if (!resp.ok) throw new Error(`Bootstrap ${resp.status}`)
    const data = await resp.json()
    bootstrapRef.current = data
    return data
  }

  useEffect(() => () => {
    connectingRef.current = false
    readyWaitersRef.current = []
    const mgr = managerRef.current
    managerRef.current = null
    if (mgr) mgr.disconnect().catch(() => {})
  }, [])

  const connect = useCallback(async () => {
    if (connectingRef.current) {
      console.log('[agent] guard — connect already in progress')
      return
    }
    const cur = agentStateRef.current
    if (cur === 'connected' || cur === 'ready' || cur === 'talking') {
      console.log('[agent] guard — already', cur)
      return
    }

    connectingRef.current = true
    setState('connecting')
    console.log('[agent] connect() start')

    try {
      const { agentId, clientKey } = await fetchBootstrap()

      if (!agentId || !clientKey) {
        console.warn('[agent] not configured — missing agentId or clientKey')
        setState('disconnected')
        connectingRef.current = false
        return
      }

      console.log('[agent] createAgentManager() — agentId:', agentId)
      const manager = await createAgentManager(agentId, {
        auth: { type: 'key', clientKey },
        debug: true,
        callbacks: {
          onSrcObjectReady(srcObject) {
            // This is the moment the streaming manager is fully initialized.
            // chat() is safe to call from this point on.
            console.log('[agent] onSrcObjectReady — streaming manager ready; draining',
              readyWaitersRef.current.length, 'waiter(s)')
            if (videoRef.current) videoRef.current.srcObject = srcObject
            setState('ready')
            readyWaitersRef.current.forEach(r => r())
            readyWaitersRef.current = []
          },

          onConnectionStateChange(state) {
            console.log('[agent] connection state →', state)
            if (state === ConnectionState.Connected) {
              // WebRTC connected but streaming manager NOT ready yet.
              // chat() is still unsafe here.
              if (agentStateRef.current === 'connecting') setState('connected')
            } else if (
              state === ConnectionState.Fail ||
              state === ConnectionState.Disconnected ||
              state === ConnectionState.Closed
            ) {
              if (agentStateRef.current !== 'disconnected') setState('error')
            }
          },

          onAgentActivityStateChange(state) {
            const talking = state === AgentActivityState.Talking
            // Set ref synchronously so mic guards in DidDemo see it without React delay
            isAgentTalkingRef.current = talking
            console.log('[agent] activity →', state, '| agentState:', agentStateRef.current)
            setAgentActivity(state)
            if (talking) {
              setState('talking')
            } else if (agentStateRef.current === 'talking') {
              setState('ready')
            }
          },

          onNewMessage(messages, type) {
            const latest = messages[messages.length - 1]
            console.log('[agent] onNewMessage — type:', type,
              '| total msgs:', messages.length,
              '| latest role:', latest?.role,
              '| latest content:', latest?.content?.slice(0, 80))
            if (type === 'answer' && messages.length > 0) {
              if (latest?.content) {
                console.log('[agent] delivering answer to handleAgentMessage')
                onAgentMessageRef.current?.(latest.content)
              } else {
                console.warn('[agent] type=answer but latest.content is empty:', latest)
              }
            }
          },

          onError(error, errorData) {
            console.error('[agent] SDK error:', error, errorData)
          },
        },
      })

      console.log('[agent] createAgentManager() resolved — calling manager.connect()')
      managerRef.current = manager
      await manager.connect()
      // NOTE: manager.connect() resolves at WebRTC Connected, NOT at onSrcObjectReady.
      // The streaming manager is still initializing asynchronously at this point.
      console.log('[agent] manager.connect() resolved — WebRTC up; awaiting onSrcObjectReady for full readiness')
      connectingRef.current = false
    } catch (e) {
      console.error('[agent] connect failed:', e)
      setState('error')
      connectingRef.current = false
    }
  }, [])

  /**
   * Returns a promise that resolves when agentState reaches 'ready' (onSrcObjectReady
   * has fired and the streaming manager is initialized).  If already ready, resolves
   * immediately.  The caller should race this with a timeout to avoid hanging on error.
   */
  const whenReady = useCallback(() => {
    const cur = agentStateRef.current
    if (cur === 'ready' || cur === 'talking') {
      console.log('[agent] whenReady — already ready, resolving immediately')
      return Promise.resolve()
    }
    console.log('[agent] whenReady — enqueuing waiter (current state:', cur, ')')
    return new Promise(resolve => {
      readyWaitersRef.current.push(resolve)
    })
  }, [])

  const chat = useCallback(async (text) => {
    if (!managerRef.current) {
      console.warn('[agent] chat() blocked — manager is null')
      return null
    }
    const state = agentStateRef.current
    if (state !== 'ready' && state !== 'talking') {
      console.warn('[agent] chat() blocked — streaming manager not ready (state:', state,
        ') — call whenReady() before chat()')
      return null
    }
    console.log('[agent] chat() → text:', text.slice(0, 80), '| state:', state)
    try {
      const result = await managerRef.current.chat(text)
      console.log('[agent] chat() resolved — result keys:', result ? Object.keys(result) : null,
        '| result.result:', result?.result?.slice?.(0, 80) ?? result?.result)
      return result
    } catch (e) {
      console.error('[agent] chat() threw:', e)
      return null
    }
  }, [])

  const disconnect = useCallback(async () => {
    connectingRef.current = false
    isAgentTalkingRef.current = false
    readyWaitersRef.current = []   // drop any pending waiters; session is over
    const mgr = managerRef.current
    managerRef.current = null
    if (mgr) {
      try { await mgr.disconnect() } catch (_) {}
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setState('disconnected')
    setAgentActivity(AgentActivityState.Idle)
  }, [])

  const isAgentTalking = agentActivity === AgentActivityState.Talking

  return {
    agentState, agentStateRef, agentActivity,
    isAgentTalking, isAgentTalkingRef,
    videoRef,
    connect, whenReady, chat, disconnect,
  }
}
