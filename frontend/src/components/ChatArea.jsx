import React from "react";
import { useSelector } from "react-redux";
import { useRef ,useEffect } from "react";
import dateParser from "../util/dateParser";
import { getSocket } from "../util/socketInstance";
import { useDispatch,useStore } from "react-redux";

import { addMessage, setMessages, setUsers } from "../store/chatSlice";
import InitialsAvatar from 'react-initials-avatar';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';


function ChatArea(){
    const messages = useSelector(state=>state.chat.messages);
    const selectedUser = useSelector(state=>state.chat.selectedUser);
    const currentUser = useSelector(state=>state.auth.userData);
    const bottomRef = useRef(null);
    const dispatch = useDispatch();
    const store = useStore();
    const socketStatus = useSelector(state=>state.auth.socketStatus);


    useEffect(() => {
        if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    // concept the messages in useEffect wont get autoUpdated bcoz useEffect will capture the first instance of message array
    // and will update onl on reload if dependency array is empty
    useEffect(()=>{
      if(socketStatus){
      getSocket().on('receive-message',(msg)=>{
        
        if(msg.recieverId===currentUser._id) {
          if(msg.senderId===selectedUser._id) dispatch(addMessage({msg}));
          
          const state = store.getState();
          const users = state.chat.users
          
          const updatedUsers = users.map((user) => {
          
          if (user._id === msg.senderId || user._id === msg.recieverId) {
            return { ...user, lastMsg: msg };
          }
          return user;
        });

        dispatch(setUsers({users:updatedUsers}));


        }
        else console.log("rejecting")
      })
      

    }
    else{
        console.log("socket not connected as of now")
      }
   
    return ()=>{
      if(socketStatus) getSocket().off('recieve-message')  // nned a cleanup logic bcoz elsewise for same event many listeners will be attached
    }

    },[socketStatus])

    


    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] ">
            <nav className="w-full h-16 bg-base-100 shadow-md">
                <div
                className="flex items-center gap-4 py-1 px-4 w-full rounded "
                >
                <div className="avatar">
                    <div className="w-14 rounded-full border-2">
                         {selectedUser.profilePic ? (
                        <img src={selectedUser.profilePic} alt={selectedUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <InitialsAvatar name={selectedUser.name} className="w-full h-full flex items-center justify-center text-3xl"/>
                      )}
                    </div>
                </div>
                <span className="font-semibold text-lg">{selectedUser.name}</span>
            </div>

            </nav>
            <div className={`${useSelector(state=>state.theme.theme)=='dark'?'bg-[url(../../doodle-dark.png)]':'bg-[url(../../doodle-light.png)]'} w-full h-[calc(100vh-9rem)] overflow-y-scroll `}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
      {messages.map((msg) => {
        const isSender = msg.senderId === currentUser._id;
        return (
          <div
            key={msg._id}
            className={`chat ${isSender ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="rounded-full border-2 border-gray-400 w-10 flex items-center justify-center h-full bg-base-100">
                {isSender?
                (
                  currentUser.profilePic ? (
                        <img src={currentUser.profilePic} alt={currentUser.name} className="rounded-full h-12 w-10"/>
                      ) : (
                        <div className="h-full w-full ">
                            <InitialsAvatar name={currentUser.name} className="flex h-full w-full items-center justify-center " />
                        </div>
                      )
                )
                :
                (
                  selectedUser.profilePic ? (
                        <img src={selectedUser.profilePic} alt={selectedUser.name} className="rounded-full h-12 w-10"/>
                      ) : (
                        <div className="h-full w-full">
                            <InitialsAvatar name={selectedUser.name} className="flex h-full w-full items-center justify-center" />
                        </div>
                      )

                )}
                {/* <img
                  src={isSender ? currentUser.profilePic : selectedUser.profilePic}
                  alt="profile"
                /> */}
              </div>
            </div>
            <div className="chat-footer opacity-50">
              {dateParser(msg.createdAt)}

            </div>
            <div className={` ${isSender?"chat-bubble-success text-black text-xl chat-bubble":"chat-bubble text-white bg-gray-500 text-xl"}`}>
              {msg.img && 
              <img src={msg.img} alt="img" className="sm:max-w-[10rem]  md:max-w-[15rem] max-h-[12rem] w-auto rounded-md cursor-pointer" 
              onClick={()=>{
                window.open(msg.img);
              }}
              />
              }
              {msg.text}
              

            </div>
          </div>
        );
      })}

      {/* Empty div to auto-scroll to bottom */}
      <div ref={bottomRef} />
      </div>

                
            </div>
        </div>


    );

}

export default ChatArea;