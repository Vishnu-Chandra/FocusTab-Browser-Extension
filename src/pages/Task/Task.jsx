import React from 'react'
import './Task.css' 
import {useBrowser} from '../../contest/browser-context.jsx'
import { useEffect,Fragment , useState } from 'react'
import { quotes } from '../../db/quotes.js'
import Todo from '../../components/Todo.jsx'
const idx= Math.floor(Math.random() * quotes.length);
const quote=quotes[idx].quote;


const Task = ({ onOpenPomodoro }) => {
    const {browserDispatch,time,message,name,task}=useBrowser();
  

    const [isChecked, setIsChecked] = useState(localStorage.getItem(false));
    const [isTodoOpen,setIsTodoOpen]=useState(false);

    useEffect(()=>{
        const userTask=localStorage.getItem("task");
        browserDispatch({
            type:'TASK',
            payload:userTask
        });
        if(new Date().getDate() !== Number(localStorage.getItem("date"))){
            localStorage.removeItem("task");
            localStorage.removeItem("date");
            localStorage.removeItem("checkedStatus");
        }
    },[])

    useEffect(()=>{
       const checkedStatus=localStorage.getItem("checkedStatus");
       setIsChecked(checkedStatus==='true');
    },[])



    useEffect(()=>{
        getCurrentTime();
    },[time])

   const getCurrentTime=()=>{
        const today=new Date();
        const hours=today.getHours();
        const minutes=today.getMinutes();

        const hour=hours<10 ? `0${hours}` : hours;
        const minute=minutes<10 ? `0${minutes}` : minutes;

        setTimeout(getCurrentTime,1000);
        
        browserDispatch({
            type:'TIME',
            payload:`${hour}:${minute}`
        });

        browserDispatch({
            type:'MESSAGE',
            payload:hours
        });

    }
      
  const handleSubmit=(event)=>{
        event.preventDefault();
  }

  const handleTaskChange=(event)=>{
     if(event.key==='Enter' && event.target.value.length>0){
       browserDispatch({
            type:'TASK',
            payload:event.target.value
       });
        localStorage.setItem("task", event.target.value);
        localStorage.setItem("date", new Date().getDate());
     }
  }

  const handleCompleteTaskChange=(event)=>{
    if(event.target.checked){
       setIsChecked(isChecked => !isChecked)
    }
    else setIsChecked(isChecked => !isChecked)
    localStorage.setItem("checkedStatus",!isChecked)
  }


   const handleClearClick=()=>{
      browserDispatch({
        type:'CLEAR'
      })
      setIsChecked(false);  
      localStorage.removeItem("task");
      localStorage.removeItem("checkedStatus");
   }


    const handleTodoClick=()=>{
        setIsTodoOpen(isTodoOpen => !isTodoOpen);
    }
       
  return (
    <div className="task-container d-flex direction-column align-center relative">
        <span className="time">{time}</span>
        <span className='message'>{message}, {name}</span>
        {name !==null && task===null ?(
          <Fragment>
           <span className='focus-question'>What is your miain focus for today?</span>
           <form onSubmit={handleSubmit}>
              <input required className="input task-input" onKeyPress={handleTaskChange}/>
           </form>
        </Fragment>):(
          <div className='user-task-container d-flex direction-column align-center gap-sm'>
            <span className='heading-2'>Today's Focus</span>
            <div className='d-flex align-center'>
              <label className={`${isChecked ? 'strike-through' : ''} heading-3 d-flex align-center gap-sm`}>
              <input className='check' type="checkbox" onChange={handleCompleteTaskChange} checked={isChecked}/>  {task}
              </label>
              <button className='button' onClick={handleClearClick}>
                 <span className='material-icons-outlined'>clear</span>
              </button>
            </div>
      
              
        </div>

        )}
        <div className="quote-container">
            <span className='heading-3'>{quote}</span>
        </div>
           {isTodoOpen && <Todo/>}
           <div className='todo-btn-container absolute '>
             <button className='button cursor todo-btn' onClick={handleTodoClick}>ToDo</button>
           </div>
           <div className='pomodoro-nav absolute '>
             <button className='button cursor pomodoro-nav-btn' onClick={onOpenPomodoro}>Pomodoro</button>
           </div>
        
    </div>
  )
}

export default Task;