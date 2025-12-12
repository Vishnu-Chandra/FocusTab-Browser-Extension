import React, { useMemo } from 'react'
import './PomodoroTimer.css'
import { usePomodoro, formatMs } from '../hooks/usePomodoro'

const ringProps = {
  size: 160,
  stroke: 10,
}

const PomodoroTimer = ({ onWorkComplete }) => {
  const {
    state,
    start,
    pause,
    reset,
    skip,
    toggleRun,
    toggleAutoStart,
    toggleSound,
    toggleNotifications,
  } = usePomodoro({ onWorkComplete })

  const circumference = useMemo(
    () => 2 * Math.PI * ((ringProps.size - ringProps.stroke) / 2),
    []
  )
  const dashOffset = useMemo(
    () => circumference * (1 - state.percentComplete / 100),
    [circumference, state.percentComplete]
  )

  const sessionHelp = useMemo(() => {
    switch (state.mode) {
      case 'work':
        return 'Work — Focus now'
      case 'shortBreak':
        return 'Short Break — Relax'
      case 'longBreak':
        return 'Long Break — Recharge'
      default:
        return ''
    }
  }, [state.mode])

  const nextLabel = useMemo(() => {
    if (state.mode === 'work') {
      const nextCycle = state.cycleCount + 1
      const isLong = nextCycle % state.roundsBeforeLongBreak === 0
      return isLong ? 'Long Break' : 'Short Break'
    }
    return 'Work'
  }, [state.mode, state.cycleCount, state.roundsBeforeLongBreak])

  return (
    <div className="pomodoro-card">
      <div className="sr-only" aria-live="polite">
        {`${state.label} ${state.isRunning ? 'started' : 'paused'}, ${formatMs(state.remainingMs)} remaining`}
      </div>

      <div className="pomodoro-top">
        <div className="pomodoro-label">{state.label}</div>
        <div className="pomodoro-subtitle">{sessionHelp}</div>
      </div>

      <div className="pomodoro-ring-wrap" role="img" aria-label={`${formatMs(state.remainingMs)} remaining`}>
        <svg
          className="pomodoro-ring"
          width={ringProps.size}
          height={ringProps.size}
        >
          <circle
            className="pomodoro-ring-bg"
            strokeWidth={ringProps.stroke}
            r={(ringProps.size - ringProps.stroke) / 2}
            cx={ringProps.size / 2}
            cy={ringProps.size / 2}
          />
          <circle
            className="pomodoro-ring-progress"
            strokeWidth={ringProps.stroke}
            r={(ringProps.size - ringProps.stroke) / 2}
            cx={ringProps.size / 2}
            cy={ringProps.size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="pomodoro-time">{formatMs(state.remainingMs)}</div>
      </div>

      <div className="pomodoro-controls" aria-label="Timer controls">
        <button
          className="pomodoro-btn primary"
          onClick={toggleRun}
          aria-pressed={state.isRunning}
        >
          {state.isRunning ? 'Pause (Space)' : 'Start (Space)'}
        </button>
        <button className="pomodoro-btn" onClick={reset} aria-label="Reset timer">
          Reset (R)
        </button>
        <button className="pomodoro-btn" onClick={skip} aria-label="Skip to next session">
          Skip / Next (N)
        </button>
      </div>

      <div className="pomodoro-toggles" aria-label="Timer settings">
        <button
          className={`pomodoro-chip ${state.autoStart ? 'active' : ''}`}
          onClick={toggleAutoStart}
          aria-pressed={state.autoStart}
        >
          Auto-start next
        </button>
        <button
          className={`pomodoro-chip ${state.soundEnabled ? 'active' : ''}`}
          onClick={toggleSound}
          aria-pressed={state.soundEnabled}
        >
          Sound (M)
        </button>
        <button
          className={`pomodoro-chip ${state.notificationsEnabled ? 'active' : ''}`}
          onClick={toggleNotifications}
          aria-pressed={state.notificationsEnabled}
        >
          Notifications
        </button>
      </div>

      <div className="pomodoro-meta">
        <span>Completed work sessions: {state.cycleCount}</span>
        <span>Next: {nextLabel}</span>
      </div>

      <div className="pomodoro-hint">
        Shortcuts: Space = start/pause, R = reset, N = next, M = mute/unmute
      </div>
    </div>
  )
}

export default PomodoroTimer
