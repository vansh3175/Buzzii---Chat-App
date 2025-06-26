import React, { useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice";
import { Moon, Sun,LogOut } from "lucide-react";
import {logout} from "../store/authSlice"
import axios from "axios";
import { setMessages, setSelectedUser } from "../store/chatSlice";

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
        .then(()=>{
            navigate('/login');
            localStorage.removeItem('selectedUser');
            dispatch(setSelectedUser({user:null}));
            
            dispatch(logout());
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    return (
        <div className="navbar bg-warning w-full h-16 flex justify-between px-6 py-10">
            <div className="navbar-start">
                <Link to="/">
                    <h1 className="font-bold italic text-black text-3xl">Buzzii</h1>
                </Link>
            </div>
            <div className="navbar-end px-4" >
                <button className="m-4  rounded-3xl p-4 cursor-pointer hover:bg-amber-500 ease-in duration-200 " onClick={()=>{
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
                        <button className="btn btn-warning hover:bg-amber-500  border-0 text-2xl ease-in duration-200 text-black p-4 m-4 py-8 rounded-2xl" onClick={()=>{navigate('/login')} }>Login</button>
                        <button className="btn btn-warning hover:bg-amber-500  border-0 text-2xl ease-in duration-200 text-black p-4 m-4 py-8 rounded-2xl" onClick={()=>{navigate('/signup')}}>Register</button>
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
               
                        <img src={userData.profilePic} alt={userData.name} className="rounded-full h-12 w-12"/>
                        <span className="text-2xl text-black font-semibold hidden md:inline px-1">Profile</span>
                    </button>
                        </>
                    )
                }
                
            </div>

        </div>
        
    );
}