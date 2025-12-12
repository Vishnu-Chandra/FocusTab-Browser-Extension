import React, { useState } from 'react'
import './App.css'
import {images } from './db/images.js'
import Home from './pages/Home/Home.jsx'
import {useBrowser} from './contest/browser-context.jsx'
import Task from './pages/Task/Task.jsx'
import PomodoroPage from './pages/Pomodoro/Pomodoro.jsx'
import { useEffect } from 'react'


  const img_index= Math.floor(Math.random() * images.length);
  const backgroundImage = images[img_index].image;
const App = () => {
  const [view, setView] = useState('task')
  const {name,browserDispatch}=useBrowser();
  
  useEffect(()=>{
    const userName=localStorage.getItem("name");
    browserDispatch({
      type:'NAME',
      payload:userName
    }); 
  },[])
  const renderView = () => {
    if (!name) return <Home />
    if (view === 'pomodoro') return <PomodoroPage onBack={() => setView('task')} />
    return <Task onOpenPomodoro={() => setView('pomodoro')} />
  }

  return (
    <div className="app" style={{ backgroundImage: `url(${backgroundImage})` }}>
        {renderView()}
    </div>
  )
}

export default App