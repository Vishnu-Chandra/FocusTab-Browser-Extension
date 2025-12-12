import { useEffect, useMemo, useRef, useState } from 'react'

const STATE_KEY = 'pomodoro_state'
const SETTINGS_KEY = 'pomodoro_settings'

const DEFAULT_SETTINGS = {
  work: 1500, // seconds
  shortBreak: 300,
  longBreak: 900,
  roundsBeforeLongBreak: 4,
  autoStart: false,
  sound: true,
  notifications: false,
}

const DEFAULT_STATE = (settings = DEFAULT_SETTINGS) => ({
  mode: 'work',
  remainingMs: settings.work * 1000,
  isRunning: false,
  cycleCount: 0, // completed work sessions
  startedAt: null,
})

const MODE_META = {
  work: { label: 'Work', subtitle: 'Focus now' },
  shortBreak: { label: 'Short Break', subtitle: 'Relax' },
  longBreak: { label: 'Long Break', subtitle: 'Recharge' },
}

export const formatMs = (ms) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const getNextMode = (mode, cycleCount, settings) => {
  if (mode === 'work') {
    const nextCycle = cycleCount + 1
    const isLong = nextCycle % settings.roundsBeforeLongBreak === 0
    return { nextMode: isLong ? 'longBreak' : 'shortBreak', nextCycle }
  }
  return { nextMode: 'work', nextCycle: cycleCount }
}

const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch (e) {
    return fallback
  }
}

const resolveInitialState = (settings) => {
  const saved = safeParse(STATE_KEY, DEFAULT_STATE(settings))
  // If previously running, adjust remaining based on elapsed time
  if (saved.isRunning && saved.startedAt) {
    const elapsed = Date.now() - saved.startedAt
    const remaining = Math.max(saved.remainingMs - elapsed, 0)
    return {
      ...saved,
      remainingMs: remaining,
      isRunning: remaining > 0 ? true : false,
      startedAt: remaining > 0 ? Date.now() : null,
    }
  }
  return saved
}

// Simple chime with AudioContext (resumed to avoid autoplay blocking) plus HTMLAudio fallback.
const CHIME_DATA_URL =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAAA'

const playChime = async (enabled) => {
  if (!enabled) return
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (Ctor) {
      const ctx = new Ctor()
      await ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.72)
      return
    }
  } catch (e) {
    // fall through to HTMLAudio fallback
  }
  try {
    const audio = new Audio(CHIME_DATA_URL)
    await audio.play()
  } catch (e) {
    // ignore audio errors (e.g., autoplay restrictions)
  }
}

const notify = async ({ title, body, enabled }) => {
  if (!enabled || typeof Notification === 'undefined') return
  if (Notification.permission === 'granted') {
    new Notification(title, { body })
    return
  }
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      new Notification(title, { body })
    }
  }
}

const maybeVibrate = () => {
  if (navigator?.vibrate) {
    navigator.vibrate([80, 40, 80])
  }
}

export const usePomodoro = ({ onWorkComplete } = {}) => {
  const [settings, setSettings] = useState(() => safeParse(SETTINGS_KEY, DEFAULT_SETTINGS))
  const [state, setState] = useState(() => resolveInitialState(settings))
  const tickRef = useRef(null)
  const lastTickRef = useRef(null)

  const sessionDurationMs = useMemo(() => {
    const seconds =
      state.mode === 'work'
        ? settings.work
        : state.mode === 'shortBreak'
        ? settings.shortBreak
        : settings.longBreak
    return seconds * 1000
  }, [state.mode, settings])

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ ...state, sessionDurationMs })
    )
  }, [state, sessionDurationMs])

  const updateState = (partial) =>
    setState((prev) => ({ ...prev, ...partial }))

  const start = () => {
    updateState({ isRunning: true, startedAt: Date.now() })
    lastTickRef.current = Date.now()
  }

  const pause = () => {
    setState((prev) => {
      if (!prev.isRunning) return prev
      const now = Date.now()
      const elapsed = prev.startedAt ? now - prev.startedAt : 0
      const remainingMs = Math.max(prev.remainingMs - elapsed, 0)
      return { ...prev, isRunning: false, remainingMs, startedAt: null }
    })
  }

  const reset = () => {
    setState(DEFAULT_STATE(settings))
    lastTickRef.current = null
  }

  const toggleRun = () => (state.isRunning ? pause() : start())

  const applyNextMode = (nextMode, nextCycle, autoStart) => {
    const nextDuration =
      nextMode === 'work'
        ? settings.work
        : nextMode === 'shortBreak'
        ? settings.shortBreak
        : settings.longBreak
    const isRunning = autoStart
    setState({
      mode: nextMode,
      cycleCount: nextCycle,
      remainingMs: nextDuration * 1000,
      isRunning,
      startedAt: isRunning ? Date.now() : null,
    })
    if (isRunning) {
      lastTickRef.current = Date.now()
    }
  }

  const skip = () => {
    const { nextMode, nextCycle } = getNextMode(state.mode, state.cycleCount, settings)
    applyNextMode(nextMode, nextCycle, settings.autoStart)
  }

  const completeSession = async () => {
    await playChime(settings.sound)
    maybeVibrate()
    await notify({
      title: `${MODE_META[state.mode].label} complete`,
      body: 'Switching to the next session',
      enabled: settings.notifications,
    })
    if (state.mode === 'work' && typeof onWorkComplete === 'function') {
      onWorkComplete()
    }
    const { nextMode, nextCycle } = getNextMode(state.mode, state.cycleCount, settings)
    applyNextMode(nextMode, nextCycle, settings.autoStart)
  }

  // Timer loop
  useEffect(() => {
    if (!state.isRunning) {
      if (tickRef.current) {
        clearInterval(tickRef.current)
        tickRef.current = null
      }
      return
    }
    tickRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.isRunning) return prev
        const now = Date.now()
        const elapsed = lastTickRef.current ? now - lastTickRef.current : 0
        lastTickRef.current = now
        const remainingMs = Math.max(prev.remainingMs - elapsed, 0)
        if (remainingMs <= 0) {
          return { ...prev, remainingMs: 0, isRunning: false, startedAt: null }
        }
        return { ...prev, remainingMs }
      })
    }, 1000)
    lastTickRef.current = Date.now()
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [state.isRunning])

  // Handle completion when remaining hits 0
  useEffect(() => {
    if (state.remainingMs === 0 && !state.isRunning) {
      completeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.remainingMs, state.isRunning])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === ' ') {
        e.preventDefault()
        toggleRun()
      } else if (e.key.toLowerCase() === 'r') {
        reset()
      } else if (e.key.toLowerCase() === 'n') {
        skip()
      } else if (e.key.toLowerCase() === 'm') {
        setSettings((prev) => ({ ...prev, sound: !prev.sound }))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const toggleAutoStart = () => setSettings((prev) => ({ ...prev, autoStart: !prev.autoStart }))
  const toggleSound = () => setSettings((prev) => ({ ...prev, sound: !prev.sound }))
  const toggleNotifications = () =>
    setSettings((prev) => ({ ...prev, notifications: !prev.notifications }))

    // Ask for notification permission when toggled on
    useEffect(() => {
      if (settings.notifications && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    }, [settings.notifications])

  const percentComplete = useMemo(() => {
    if (!sessionDurationMs) return 0
    return Math.min(100, Math.max(0, 100 - (state.remainingMs / sessionDurationMs) * 100))
  }, [state.remainingMs, sessionDurationMs])

  const meta = MODE_META[state.mode]

  return {
    state: {
      mode: state.mode,
      remainingMs: state.remainingMs,
      isRunning: state.isRunning,
      cycleCount: state.cycleCount,
      sessionDurationMs,
      percentComplete,
      label: meta.label,
      subtitle: meta.subtitle,
      autoStart: settings.autoStart,
      soundEnabled: settings.sound,
      notificationsEnabled: settings.notifications,
      roundsBeforeLongBreak: settings.roundsBeforeLongBreak,
    },
    settings,
    start,
    pause,
    reset,
    skip,
    toggleRun,
    toggleAutoStart,
    toggleSound,
    toggleNotifications,
    setSettings,
    setState,
  }
}
