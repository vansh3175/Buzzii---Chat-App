import React from "react";
import { useSelector } from "react-redux";
import { useRef ,useEffect } from "react";
import dateParser from "../util/dateParser";
import { getSocket } from "../util/socketInstance";
import { useDispatch } from "react-redux";
import { setMessages } from "../store/chatSlice";


function ChatArea(){
    const messages = useSelector(state=>state.chat.messages);
    const selectedUser = useSelector(state=>state.chat.selectedUser);
    const currentUser = useSelector(state=>state.auth.userData);
    const bottomRef = useRef(null);
    const dispatch = useDispatch();
    const socket = getSocket();


    useEffect(() => {
        if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    // concept the messages in useEffect wont get autoUpdated bcoz useEffect will capture the first instance of message array
    // and will update onl on reload if dependency array is empty
    useEffect(()=>{
      if(socket){
      socket.on('receive-message',(msg)=>{
        dispatch(setMessages({messages:[...messages,msg]}));
      })
      

    }
    else{
        console.log("socket not connected as of now")
      }
   
    return ()=>{
      if(socket) socket.off('recieve-message')  // nned a cleanup logic bcoz elsewise for same event many listeners will be attached
    }

    },[messages])
    // every new msg will cause the useEffect to run again
    


    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <nav className="w-full h-16 bg-base-100 shadow-md">
                <div
                className="flex items-center gap-4 py-1 px-4 w-full rounded "
                >
                <div className="avatar">
                    <div className="w-14 rounded-full">
                        <img src={selectedUser.profilePic} alt={selectedUser.name} />
                    </div>
                </div>
                <span className="font-semibold text-lg">{selectedUser.name}</span>
            </div>

            </nav>
            <div className={`${useSelector(state=>state.theme.theme)=='dark'?'bg-[url(../../doodle-dark.png)]':'bg-[url(../../doodle-light.png)]'} w-full h-[calc(100vh-9rem)] overflow-scroll`}>
                <div className="flex-1 overflow-y-auto px-4">
      {messages.map((msg) => {
        const isSender = msg.senderId === currentUser._id;
        return (
          <div
            key={msg._id}
            className={`chat ${isSender ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={isSender ? currentUser.profilePic : selectedUser.profilePic}
                  alt="profile"
                />
              </div>
            </div>
            <div className="chat-footer opacity-50">
              {dateParser(msg.createdAt)}

            </div>
            <div className={`${isSender?"chat-bubble-success text-black text-xl chat-bubble":"chat-bubble text-xl"}`}>
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