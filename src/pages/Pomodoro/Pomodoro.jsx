import React from 'react'
import PomodoroTimer from '../../components/PomodoroTimer.jsx'
import './Pomodoro.css'

const PomodoroPage = ({ onBack }) => {
  return (
    <div className="pomodoro-page">
      <div className="pomodoro-page__header">
        <h2>Pomodoro</h2>
        <p className="pomodoro-page__subtitle">Stay focused with work / break cycles.</p>
        <p className="pomodoro-page__hint">Default cycle: 25 – 5 – 25 – 5 – 25 – 15 (work / short break / work / short break / work / long break).</p>
      </div>

      <div className="pomodoro-page__card">
        <PomodoroTimer onWorkComplete={() => {}} />
      </div>

      <button className="pomodoro-back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>
    </div>
  )
}

export default PomodoroPage
