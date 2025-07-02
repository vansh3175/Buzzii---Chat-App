import React, { useEffect,forwardRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, setSelectedUser, addUser } from "../store/chatSlice";
import axios from "axios";
import { Dot,Plus } from "lucide-react";
import { getSocket } from "../util/socketInstance";
import InitialsAvatar from 'react-initials-avatar';
import { setUnseenCount } from "../store/chatSlice";
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';
import store from "../store/store";

const Sidebar = forwardRef(({modalhandler},ref) =>{
  const userData = useSelector(state=>state.auth.userData);
  const authStatus = useSelector(state=>state.auth.status);
  const dispatch = useDispatch();
  const users = userData?(userData.friends):[];
  const storeSelected = useSelector((state) => state.chat.selectedUser);
  const activeUsers = useSelector((state) => state.auth.activeUsers);
  const socketStatus = useSelector((state) => state.auth.socketStatus);
  const theme = useSelector(state=>state.theme.theme);
  const storeUnseenCount = useSelector(state=>state.chat.unseenCount);
  
  
//run once
  useEffect(() => {
    if(authStatus){
      const cachedUser = localStorage.getItem("selectedUser");
    if (cachedUser) {
      dispatch(setSelectedUser({ user: JSON.parse(cachedUser) }));
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URI}/chatStatus/unseenCount`, {
      withCredentials: true,
    })
    .then((res)=>{
      console.log(res);
      dispatch(setUnseenCount({unseenCount:res.data}))
    })
    .catch((err)=>{
      console.log(err)
    })
    }
  }, [authStatus]);

  useEffect(() => {   //need to check if stilll relevant
    const socket = getSocket();
    if (socket) {
      socket.on("user-created", (user) => dispatch(addUser({ user })));
    }
    return () => socket?.off("user-created");
  }, [socketStatus]);
//need to call lastSeen when storeSelected changes
  useEffect(() => {
    if (storeSelected) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URI}/chat/${storeSelected._id}`, {
          withCredentials: true,
        })
        .then((res) => dispatch(setMessages({ messages: res.data.messages })))
        .catch((err) => console.error(err));

        // Update last seen
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URI}/chatStatus/updateLastSeen`,
          { chatWith: storeSelected._id },
          { withCredentials: true }
        )
        .catch((err) => console.error("Failed to update last seen", err));

        const state = store.getState();
        const unseen = state.chat.unseenCount;
        dispatch(setUnseenCount({unseenCount:{...unseen,[storeSelected._id]:0}}))
    } else {
      dispatch(setMessages({ messages: [] }));
    }
    
  }, [storeSelected]);

  const changeSelected = (user) => {
    dispatch(setSelectedUser({ user }));
    localStorage.setItem("selectedUser", JSON.stringify(user));
  };
  
  
  return (
    <div className="sm:w-1/3 w-fit min-w-20 sm:min-w-50 max-w-80 h-[calc(100vh-5rem)] overflow-y-auto bg-base-100 sm:p-4  sm:py-4 border-r border-gray-500 overflow-hidden p-2">
      <button
      className="bg-warning text-black w-full rounded-md text-2xl font-semibold p4 my-4 cursor-pointer hidden sm:inline hover:bg-amber-500 "
      ref={ref}
      onClick={modalhandler}
      >Add friends</button>
      <button
      className="bg-warning text-black w-full rounded-md text-2xl font-semibold p4 my-4 cursor-pointer  sm:hidden flex justify-center items-center hover:bg-amber-500"
      ref={ref}
      onClick={modalhandler}
      ><Plus size={40}/></button>
      {users.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg  flex items-center">
          Your friends will show here 😎
        </div>
      ) : (
        <ul className="bg-base-100 rounded-box w-full">
          {users.map((user) => {
            const isActive = user._id === storeSelected?._id;
            return (
              <li key={user._id} className="w-full">
                <div
                  className={`flex items-center justify-center gap-4 py-4 px-2 w-full cursor-pointer rounded transition-all duration-100 ease-in-out 
                    ${isActive ? " sm:border-l-8 sm:border-yellow-500 " : "hover:bg-base-300"}
                  `}
                  onClick={() => changeSelected(user)}
                >
                  <div className="avatar relative">
                    
                      <Dot
                        size={64}
                        
                        className={`absolute z-20 -bottom-6 -right-6  ${activeUsers.includes(user._id)?"text-green-600":"text-red-600"}`}
                      />

                      {storeUnseenCount[user._id] > 0 && (
                    <span className="md:hidden bg-green-500 absolute -top-1 -right-1 text-white text-xs font-bold px-2 py-0.5 rounded-full z-30 pr-2">
                      {storeUnseenCount[user._id]}
                    </span>
                  )}
                    
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 ${isActive ? "border-4 border-warning" : ""}`}>
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <InitialsAvatar name={user.name} className="w-full h-full flex items-center justify-center text-3xl"/>
                      )}
                    </div>
                    </div>
                  </div>
                 <div className="hidden sm:flex flex-col overflow-hidden w-full">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">{user.name}</p>
                      
                    </div>
                    <div>
                      <p
                      className={`text-sm overflow-hidden whitespace-nowrap text-ellipsis ${theme=='dark'?"text-gray-200":"text-gray-800"}
                      }`}
                    >
                    {
                      user.lastMsg?(

                        (user._id===user.lastMsg.recieverId)?(
                          user.lastMsg.img?(
                          user.lastMsg.text?(`You : [IMAGE] ${user.lastMsg.text}`):("You : [IMAGE]")
                        ):(`You : ${user.lastMsg.text}`)
                        ):(
                          user.lastMsg.img?(
                          user.lastMsg.text?(`[IMAGE] ${user.lastMsg.text}`):("[IMAGE]")
                        ):(user.lastMsg.text)
                        )
                      ):(
                        ""
                      )
                    }
                    </p>
                    
                    </div>
                    
                  </div>
                  {storeUnseenCount[user._id] > 0 && (
                    <span className="hidden md:inline bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-30 pr-2">
                      {storeUnseenCount[user._id]}
                    </span>
                  )}


                </div>
                <hr className="hidden sm:block text-gray-500" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
})

export default Sidebar;
