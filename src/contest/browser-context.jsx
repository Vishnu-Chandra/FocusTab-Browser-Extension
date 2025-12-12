import {createContext,useContext ,useReducer} from 'react';
import browserReducer from '../reducer/browser-reducer.jsx';
const initialState = {
    name: '',
    time: '',
    message:'',
    task:null
};

const BrowserContest=createContext(initialState);

const BrowserProvider=({children})=>{
    
    const [{name,time,message,task},browserDispatch]=useReducer(browserReducer, initialState);

    return(
        <BrowserContest.Provider value={{name, time, message,task, browserDispatch}}>
            {children}
        </BrowserContest.Provider>
    )
}

const useBrowser=() => useContext(BrowserContest);

export {BrowserProvider,useBrowser};
