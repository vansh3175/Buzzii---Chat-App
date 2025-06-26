import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import { useDispatch, useSelector } from "react-redux";
import ChatArea from "../components/ChatArea"
import ChatTypeArea from "../components/ChatTypeArea"
import axios from 'axios'
import {useNavigate} from 'react-router-dom';
import { setUsers } from "../store/chatSlice";


export default function Home(){

    const selectedUser = useSelector(state=>state.chat.selectedUser);
    const authStatus = useSelector(state=>state.auth.status);
    const navigate = useNavigate();
    const dispatch = useDispatch();



    useEffect(()=>{
        
        if(authStatus){
            
        axios.get('http://localhost:5000/user/getUsers',{withCredentials:true})
            .then((res)=>{
                dispatch(setUsers({users:res.data.users}));
                
            })
            .catch((err)=>{
                console.log(err);
        })

        }
    },[])

    return (
        <div className="flex w-full">
            <Sidebar/>
            
                <div className="w-full h-[calc(100vh-5rem)]">
                
                    {selectedUser?<ChatArea/>:<NoChatSelected/>}
                    {selectedUser?<ChatTypeArea/>:null}
                    
                </div>
            
            
        </div>

    );


    
}