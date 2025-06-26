import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



const AuthLayout = ({children})=>{
    const loading = useSelector(state=>state.auth.loading);
    const authStatus = useSelector(state=>state.auth.status);
    const navigate = useNavigate();

    useEffect(()=>{

       if(!loading && !authStatus){
        navigate('/login');
       }
    },[authStatus,navigate,loading])
        
    return loading?<div className="w-screen h-[calc(100vh-5rem)] flex justify-center align-middle items-center">
        <span className="loading loading-dots loading-xl"></span>

    </div>:<>{children}</>


}

export default AuthLayout;
