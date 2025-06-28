import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import { useDispatch, useSelector } from "react-redux";
import ChatArea from "../components/ChatArea"
import ChatTypeArea from "../components/ChatTypeArea"
import axios from 'axios'
import {useNavigate} from 'react-router-dom';
import { setUsers } from "../store/chatSlice";
import { setUsersLoading } from "../store/chatSlice";


export default function Home(){

    const selectedUser = useSelector(state=>state.chat.selectedUser);
    const authStatus = useSelector(state=>state.auth.status);
    const navigate = useNavigate();
    const dispatch = useDispatch();



    useEffect(() => {
    const fetchUsersWithLastMessages = async () => {
        try {
        dispatch(setUsersLoading({ status: true }));

        const res = await axios.get('http://localhost:5000/user/getUsers', { withCredentials: true });
        const users = res.data.users;

        const usersWithLastMsg = await Promise.all(
            users.map(async (user) => {
            try {
                
                const result =  await axios.get(`http://localhost:5000/chat/${user._id}`, {withCredentials: true,});
                
                return { ...user, lastMsg: result.data.messages[result.data.messages.length-1] };
            } catch (err) {
                console.error("Error fetching chat for user:", user._id, err);
                return { ...user, lastMsg: null };
            }
            })
        );

        dispatch(setUsers({ users: usersWithLastMsg }));
        } catch (err) {
        console.error("Error fetching users:", err);
        } finally {
        dispatch(setUsersLoading({ status: false }));
        }
    };

    if (authStatus) {
        fetchUsersWithLastMessages();
    }
    }, [authStatus]);


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