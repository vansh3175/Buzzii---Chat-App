import { setSocketStatus } from "../store/authSlice";
import store from "../store/store";
let socket = null;


const setSocket = (newSocket)=>{
    socket = newSocket;
    store.dispatch(setSocketStatus({status:true}));

}

const getSocket =()=>socket;

const removeSocket =()=>{
    store.dispatch(setSocketStatus({status:false}));
    socket = null;
}

export {setSocket,getSocket,removeSocket};