import React, { useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice";
import { Moon, Sun,LogOut } from "lucide-react";
import {logout} from "../store/authSlice"
import axios from "axios";
import { setMessages, setSelectedUser } from "../store/chatSlice";
import InitialsAvatar from 'react-initials-avatar';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';
import toast from "react-hot-toast";


export default function NavBar(){
    const authStatus = useSelector((state)=>state.auth.status);
    let userData = useSelector(state=>state.auth.userData)
    const theme = useSelector(state=>state.theme.theme);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeTheme =()=>{
        const page = document.querySelector('html');
        if(page.getAttribute('data-theme')=='dark'){
            page.setAttribute('data-theme','light');
            localStorage.setItem('theme','light');
        }
        else {
            page.setAttribute('data-theme','dark');
            localStorage.setItem('theme','dark');

        }
    }
    //whenever page reloads keep the same theme from local storage
    useEffect(()=>{
        const page = document.querySelector('html');
        page.setAttribute('data-theme',localStorage.getItem('theme')||'light');

    },[])

    const handleLogout = ()=>{
        axios.get('http://localhost:5000/user/logout',{withCredentials:true})
        .then((res)=>{
            navigate('/login');
            localStorage.removeItem('selectedUser');
            dispatch(setSelectedUser({user:null}));
            toast.success(res.data.msg)
            
            dispatch(logout());
        })
        .catch((err)=>{
            console.log(err.response.data.msg);
        })
    }

    return (
        <div className="navbar bg-warning w-full h-16 flex justify-between sm:px-6 py-10 px-2">
            <div className="navbar-start">
                <Link to="/">
                    <h1 className="font-bold italic text-black text-3xl">Buzzii</h1>
                </Link>
            </div>
            <div className="navbar-end sm:px-4 px-1" >
                <button className="sm:m-4 m-2 rounded-3xl sm:px-4 py-4 px-2 cursor-pointer hover:bg-amber-500 ease-in duration-200 " onClick={()=>{
                    changeTheme();
                    dispatch(setTheme({theme:(theme=='dark'?'light':'dark')}))
            }}>
                
                   <div className={`transition-transform duration-500 ease-in-out ${theme === 'dark' ? 'rotate-90' : 'rotate-0'}`}>
                    {theme === 'dark' ? (
                    <Sun size={30} color="black" />
                    ) : (
                    <Moon size={30} color="black" />
                    )}
                   </div>
                </button>

                {
                    !authStatus?(
                        <>
                        <button className="btn btn-warning hover:bg-amber-500  border-0 text-2xl ease-in duration-200 text-black sm:p-4 sm:m-4 m-2 py-8 rounded-2xl px-1" onClick={()=>{navigate('/login')} }>Login</button>
                        <button className="btn btn-warning hover:bg-amber-500  border-0 text-2xl ease-in duration-200 text-black sm:p-4 sm:m-4 m-2 py-8 rounded-2xl px-1" onClick={()=>{navigate('/signup')}}>Register</button>
                        </>
                        
                    )
                    :(
                        <>
                    <button className="btn btn-warning hover:bg-amber-500 border-0 text-2xl ease-in duration-200 text-black p-4 py-8 rounded-2xl " onClick={handleLogout}> <LogOut/> <span className="hidden md:inline">Logout</span></button>
                    <button className="btn btn-warning md:hover:bg-amber-500 border-0 text-2xl ease-in duration-200 text-black p-4 py-8 rounded-2xl   flex items-center "
                    
                    onClick={()=>{
                        navigate(`/profile`);

                    }}
                    >
                        <div className="relative inline-block">
                            <img
                                src={userData.profilePic?userData.profilePic:"https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                                alt={userData.name}
                                className="rounded-full h-12 w-12"
                                />

                            {userData.recievedRequests.length > 0 && (
                                <div className=" absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full text-xs px-2 py-0.5 z-20">
                                {userData.recievedRequests.length}
                                </div>
                            )}
                            </div>

                        
                        <span className="text-2xl text-black font-semibold hidden md:inline px-1">Profile</span>
                    </button>
                        </>
                    )
                }
                
            </div>

        </div>
        
    );
}