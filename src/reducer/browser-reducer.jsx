import React from 'react'

const browserReducer = (state, action) => {
    switch(action.type){
        case 'NAME':
            return{
                ...state,
                name:action.payload
            }
        case 'TIME':
            return{
                ...state,
                time:action.payload
            }
        case 'MESSAGE':
            return{
                ...state,
                message:action.payload>=0 && action.payload<=12 ? "Good Morning" : action.payload>=12 && action.payload<=17 ? "Good Afternoon" : "Good Evening" 
            }
        case 'TASK':
            return{
                ...state,
                task:action.payload
            }

        case 'CLEAR':
            return{
                ...state,
                task:null
            }

        default:
            return state
    }
}

export default browserReducer