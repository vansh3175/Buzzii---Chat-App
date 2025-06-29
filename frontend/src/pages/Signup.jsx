import { MessageSquareIcon } from "lucide-react";
import { motion } from "framer-motion";
import SignupForm from "../components/SignupForm"; 
import { useRef } from "react";
import { login } from "../store/authSlice";
import { useDispatch,useSelector} from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setSelectedUser, setUsers } from "../store/chatSlice";
import { getSocket } from "../util/socketInstance";
import { useState } from "react";
import { useEffect } from "react";

export default function Signup() {

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newUser,setNewUser] = useState(null);
  const users = useSelector(state=>state.chat.users);

  const socketStatus = useSelector(state=>state.auth.socketStatus);


  useEffect(()=>{
    if(newUser && socketStatus && getSocket()){
      getSocket().emit('user-added',newUser);
      setNewUser(null);
    }

  },[newUser,socketStatus])
  

  const handleSubmit = (e)=>{
    e.preventDefault();
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    console.log({email,password,name});

    if(!email || !name || !password){
      return alert("fill all details");
    }
    const userData = {name,email,password};
    axios.post('http://localhost:5000/user/signup' ,userData,{withCredentials:true})
    .then((res)=>{
      console.log(res.data.user);
      dispatch(login({userData:res.data.user}));
      if(localStorage.getItem('selectedUser')) localStorage.removeItem('selectedUser');
      navigate('/');
      //could emit from socket as socket not created yet so
      setNewUser(res.data.user);

    })
    .catch((err)=>{
      console.log(err);
    })
 }

    return (
        <div className="flex flex-wrap-reverse min-h-[calc(100vh-5rem)]">
  
  <div className="md:w-2/3 lg:w-1/2 w-full  flex items-center justify-center py-8 lg:px-0 md:p-2">
    <SignupForm handleSubmit={handleSubmit} ref={{nameRef,emailRef,passwordRef}}/>
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
