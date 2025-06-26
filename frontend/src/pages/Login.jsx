import { motion } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import LoginForm from "../components/LoginForm"; 
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setSelectedUser, setUsers } from "../store/chatSlice";



export default function Login() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const users = useSelector(state=>state.chat.users);


    const handleSubmit =(e)=>{
        e.preventDefault();
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        
        if(!email || !password){
            return alert("fill all details");
        }

        const userData = {email,password};

        axios.post('http://localhost:5000/user/login' ,userData,{withCredentials:true})
        .then((res)=>{
            console.log(res.data.user);
            dispatch(login({userData:res.data.user}))
            dispatch(setUsers({users:[...users,res.data.user]}))
            if(localStorage.getItem('selectedUser')) localStorage.removeItem('selectedUser');
            navigate('/');
        })
        .catch((err)=>{
            console.log(err);
        })


        
        console.log("successful login");

    }

    return (
        <div className="flex flex-wrap-reverse min-h-[calc(100vh-5rem)]">
  
  <div className="md:w-2/3 lg:w-1/2 w-full  flex items-center justify-center  py-8 lg:px-0 md:p-2">
    <LoginForm handleSubmit={handleSubmit} ref={{emailRef,passwordRef}}/>
  </div>

  
  <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-8">
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="mb-6"
    >
      <MessageSquareIcon size={80} strokeWidth={1.5} className="text-amber-400" />
    </motion.div>

    <h2 className="text-4xl font-bold text-amber-500 mb-4">Let's Talk!</h2>
    <p className="text-lg max-w-md ">
      Connect with your community, share ideas, and build conversations that matter. 
      We're glad to have you back.
    </p>
  </div>
</div>

    );
}
