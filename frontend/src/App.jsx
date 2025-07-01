import React from "react"
import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { login,setLoading } from "./store/authSlice"
import { useDispatch,useSelector } from "react-redux"
import {io} from "socket.io-client"
import { setSocket,getSocket,removeSocket } from "./util/socketInstance"
import {setActiveUsers} from "./store/authSlice"
import axios from "axios"
import { useEffect } from "react"
import toast, { Toaster } from 'react-hot-toast';

function App() {
  
  const authStatus = useSelector(status=>status.auth.status);
  const userData = useSelector(state=>state.auth.userData);
  const socketInstance = getSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if(authStatus && !socketInstance){
      const socket = io(import.meta.env.VITE_BACKEND_URI, {
      withCredentials: true,
      query: {
        userId: userData._id,
        friends: JSON.stringify(userData.friends) // only strings are allowed
      }
      });
      
      socket.on('connect',()=>{
        setSocket(socket);
        console.log("Socket connected:", socket.id); 
      })
      socket.on('getActiveUsers',(users)=>{
          console.log("active users",users)
          dispatch(setActiveUsers({users}));
        })

      return () => {
        socket.disconnect();
        removeSocket();
        console.log("Socket disconnected");
      };
    }
   }, [authStatus]);


  useEffect(()=>{
    dispatch(setLoading({loading:true}));
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/user/getUserData`,{withCredentials:true})
    .then((res)=>{
      const data = res.data.userData
      if(data){
        dispatch(login({userData:res.data.userData}))
        
      }
      dispatch(setLoading({loading:false}));
    })
    .catch((err)=>{
      console.log(err);
      if(localStorage.getItem('selectedUser')) localStorage.clear('selectedUser');
      dispatch(setLoading({loading:false}));

    })
    

  },[])

  return (
    <div className="w-full h-full overflow-hidden">
    <div><Toaster/></div>
    <Navbar/>
    <Outlet/>
    </div>
  )
}

export default App;
