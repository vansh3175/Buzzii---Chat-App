import React, { useEffect, useState,useRef } from "react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../store/authSlice";
import ChatArea from "../components/ChatArea"
import ChatTypeArea from "../components/ChatTypeArea"
import axios from 'axios'
import {useNavigate} from 'react-router-dom';
import { setUsers } from "../store/chatSlice";
import { setUsersLoading } from "../store/chatSlice";
import { X,UserPlus,Clock,Check} from "lucide-react";



export default function Home(){

    const selectedUser = useSelector(state=>state.chat.selectedUser);
    const authStatus = useSelector(state=>state.auth.status);
    const userData = useSelector(state=>state.auth.userData);
    const dispatch = useDispatch();
    const modalRef = useRef(null)
    const [showModal,setShowModal]=useState(false);
    const [modalInput,setmodalInput] = useState("");
    const [output,setOutput] = useState([]);
    const [sendReqInfo,setSendReqInfo] = useState([]);


    const toggleModal=()=>{
        setShowModal(state=>!state);
    }

    const handleSendRequest = async (userId)=>{
        await axios.get(`http://localhost:5000/user/sendReq/${userId}`,{withCredentials:true})
        .then((res)=>{
            setSendReqInfo(prev=>([...prev,userId]));
            dispatch(setProfile({userData:res.data.userData}));
        })
        .catch((err)=>{
            console.log(err);
        })
        
    }

    useEffect(()=>{
        if(modalInput!=""){
            const timeoutId = setTimeout(()=>{
            const q = modalInput.trim();
            axios.get(`http://localhost:5000/user/getUsers?query=${q}`,{withCredentials:true})
            .then((res)=>{
                setOutput(res.data.users);
            })
            .catch((err)=>{
                console.log(err);
        })

        },500)
        return ()=>clearTimeout(timeoutId);
        
        }
        else setOutput([]);

        
    },[modalInput])
    
    useEffect(() => {
        // add a loader for sidebar (optional)
    const fetchUsersWithLastMessages = async () => {
        try {
        

       
        const users = userData.friends;

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

        dispatch(setProfile({ userData: {...userData,friends:usersWithLastMsg} }));
        } catch (err) {
        console.error("Error fetching users:", err);
        } 
        
    };

    if (authStatus) {
        fetchUsersWithLastMessages();
    }
    }, [authStatus]);


    return (
        <div className="flex w-full">
            <Sidebar ref={modalRef} modalhandler={toggleModal} />
            
                <div className={`w-full h-[calc(100vh-5rem) ${showModal?"opacity-65":""}]`}>
                
                    {selectedUser?<ChatArea/>:<NoChatSelected/>}
                    {selectedUser&&<ChatTypeArea/>}
                    
                </div>
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-40">
                        <div className="bg-base-200 p-6 rounded-xl shadow-xl w-11/12 md:w-1/2 lg:w-1/3 h-[60vh] relative">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-lg font-semibold">Add a Friend</div>
                                <button
                                    onClick={toggleModal}
                                    className="text-blue-700 hover:text-red-700 cursor-pointer"
                                >
                                    <X />
                                </button>
                            </div>

                            
                                <input
                                    type="text"
                                    value={modalInput}
                                    onChange={(e) => setmodalInput(e.target.value)}
                                    placeholder="Search name"
                                    className="w-full p-2 border border-gray-300 rounded my-4"
                                />
                                
                            

                            <div className="overflow-y-auto h-[calc(60vh-8rem)]  px-2 rounded">
                                <ul>
                                    {output.map((user) => (
                                        <li key={user._id} className="flex items-center gap-3 p-2 py-4 ">
                                            <img
                                                src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <span>{user.name}</span>
                                           {
                                            userData.friends.some(friend => friend._id === user._id) ? (
                                                <span className="ml-auto text-green-600"><Check className="w-5 h-5" /></span>
                                            ) : userData.sentRequests.some(person => person._id === user._id) || sendReqInfo.includes(user._id) ? (
                                                <span className="ml-auto text-yellow-600"><Clock className="w-5 h-5" /></span>
                                            ) : (
                                                <button
                                                    className="ml-auto text-blue-600 hover:text-blue-800 cursor-pointer"
                                                    onClick={() => handleSendRequest(user._id)}
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                </button>
                                            )
                                        }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}


                        
                        
        </div>

    );


    
}