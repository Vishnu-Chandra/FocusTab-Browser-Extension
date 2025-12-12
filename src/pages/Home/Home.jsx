import './Home.css';
import {useBrowser} from '../../contest/browser-context.jsx'
const Home=()=>{

     const {name,browserDispatch}=useBrowser();


     const handleSubmit=(event)=>{
        event.preventDefault();
     }
    const handleNameChange=(event)=>{
        if(event.key==='Enter' && event.target.value.length>0){
            browserDispatch({
                type:'NAME', 
                payload:event.target.value
            });
            localStorage.setItem("name", event.target.value);
        }
    }
    return(
        <div className="home-container d-flex direction-column align-center gap-lg">
             <h1 className="main-heading">Browser Extension</h1>
             <div className="user-details d-flex direction-column gap">
                <span className="heading-1">Hello, what's your name?</span>
                <form onSubmit={handleSubmit}>
                    <input className="input" onKeyPress={handleNameChange}/>
                </form>

             </div>
        </div>
       
    )
}

export default Home;