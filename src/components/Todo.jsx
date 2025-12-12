import { useState,useEffect } from "react";
import {v4 as uuid} from 'uuid';
import './Todo.css';
const Todo=()=>{
    const [todo,setTodo]=useState();
    const [todoList,setTodoList]=useState([]);

    useEffect(()=>{
        const userTodo=JSON.parse(localStorage.getItem('todoList'));
        userTodo && setTodoList(userTodo);
    },[])

    const handleTodoInputChange=(event)=>{
        setTodo(event.target.value);
    }

    const handleTodoEnterKey=(event)=>{
        if(event.key==='Enter' && todo){
            const newTodoList=[...todoList,{_id:uuid(),todo,isCompleted:false}];
            setTodoList(newTodoList);
            setTodo('');
            localStorage.setItem('todoList',JSON.stringify(newTodoList));
        }
    }
    const handleTodoChange=(todoId)=>{
        const updatedTodoList=todoList.map(todo => todoId===todo._id ? {...todo,isCompleted:!todo.isCompleted} : todo);
        setTodoList(updatedTodoList);
        localStorage.setItem('todoList',JSON.stringify(updatedTodoList));
    }


    const handleTodoDeleteClick=(todoId)=>{
        const filteredTodoList=todoList.filter(todo => todo._id !== todoId);
        setTodoList(filteredTodoList);
        localStorage.setItem('todoList',JSON.stringify(filteredTodoList));
    }
    return(
        <div className="todo-container absolute">
            <div className="todo-header">
                <h3 className="todo-title">My Tasks</h3>
            </div>
            <div className="todo-input-container">
                <input className="todo-input" value={todo} onChange={handleTodoInputChange} onKeyPress={handleTodoEnterKey}/>
            </div>
            <div className="todo-list">
                {
                    todoList && todoList.map(({_id,todo,isCompleted})=>{
                        return(
                            <div key={_id} className="todo-items d-flex align-center ">
                                <label className={`${isCompleted ? "strike-through" : ""} todo-label`}>
                                    <input className="todo-check" type="checkbox" onChange={()=>handleTodoChange(_id)} checked={isCompleted} />{todo}</label>
                                <button className="button cursor todo-clear-btn" onClick={()=> handleTodoDeleteClick(_id)}>
                                    <span className='material-icons-outlined'>clear</span>
                                </button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Todo