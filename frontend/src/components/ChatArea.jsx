import React, { useRef, useEffect,useState} from "react";
import { useSelector, useDispatch, useStore } from "react-redux";
import dateParser from "../util/dateParser";
import { getSocket } from "../util/socketInstance";
import { addMessage, setSelectedUser, setUnseenCount, setUsers } from "../store/chatSlice";
import InitialsAvatar from "react-initials-avatar";
import "react-initials-avatar/lib/ReactInitialsAvatar.css";
import { setProfile } from "../store/authSlice";
import axios from "axios";


function ChatArea() {
  const messages = useSelector((state) => state.chat.messages);
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const currentUser = useSelector((state) => state.auth.userData);
  const socketStatus = useSelector((state) => state.auth.socketStatus);
  const theme = useSelector((state) => state.theme.theme);
  const [confirmModel,setConfirmModel] = useState(false)
  const bottomRef = useRef(null);
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (socketStatus) {
      const socket = getSocket();
      socket.on("receive-message", (msg) => {
        const state = store.getState();
        const storeSelected = state.chat.selectedUser;
        if (msg.recieverId === currentUser._id) {
          if (storeSelected && msg.senderId === storeSelected._id) {
            dispatch(addMessage({ msg }));
          }else{
            
            const unseen = state.chat.unseenCount;
            const currentCount = unseen[msg.senderId] || 0;
            console.log("entered")
            const updatedCount = {...unseen,[msg.senderId]:currentCount+1};
            dispatch(setUnseenCount({unseenCount:updatedCount}))
          }


          
          const userData = state.auth.userData;
          const users = userData?.friends || [];

          const updatedUsers = users.map((user) =>
            user._id === msg.senderId || user._id === msg.recieverId
              ? { ...user, lastMsg: msg }
              : user
          );

          dispatch(setProfile({ userData: { ...userData, friends: updatedUsers } }));
        }
      });
    } else {
      console.log("Socket not connected yet");
    }

    return () => {
      if (getSocket() && socketStatus) getSocket().off("receive-message");
    };
  }, [socketStatus]);

  const handleRemoveFriend = (userId) => {
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/user/removeFriend/${userId}`,{withCredentials:true})
    .then((res)=>{
      dispatch(setProfile({userData:res.data.result}));
      dispatch(setSelectedUser({user:null}));
      if(localStorage.getItem('selectedUser')) localStorage.removeItem('selectedUser');
    })
    
  };

  return (
    
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {confirmModel && (
        <div className="fixed inset-0 backdrop-blur-xs z-50 flex items-center justify-center  bg-opacity-50">
          <div className="bg-base-200 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 ">Confirm Removal</h2>
            <p className=" mb-6">Are you sure you want to remove <strong>{selectedUser.name}</strong> from your friends list?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setConfirmModel(false)} className="btn btn-sm btn-neutral">Cancel</button>
              <button onClick={() => handleRemoveFriend(selectedUser._id)} className="btn btn-sm btn-error text-white">Remove</button>
            </div>
          </div>
        </div>
      )}

      <nav className="w-full h-16 bg-base-100 shadow-md">
        <div className="flex items-center justify-between py-1 px-4 w-full rounded">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-14 rounded-full border-2">
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <InitialsAvatar
                    name={selectedUser.name}
                    className="w-full h-full flex items-center justify-center text-3xl"
                  />
                )}
              </div>
            </div>
            <span className="font-semibold text-lg">{selectedUser.name}</span>
          </div>

          {/* REMOVE FRIEND BUTTON */}
          <button
            onClick={() => setConfirmModel(true)}
            className="btn btn-sm btn-outline btn-error"
            title="Remove Friend"
          >
            ❌
          </button>
        </div>
      </nav>

      <div
        className={`${
          theme === "dark"
            ? "bg-[url(../../doodle-dark.png)]"
            : "bg-[url(../../doodle-light.png)]"
        } w-full h-[calc(100vh-9rem)] overflow-y-scroll`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
          {messages.length === 0 && (
            <div className="flex w-full justify-center">
              <div className="text-center p-2 bg-gray-300 text-gray-800 border-2 border-gray-950 rounded-md opacity-80 my-4">
                Send a message to start chatting
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isSender = msg.senderId === currentUser._id;
            return (
              <div key={msg._id} className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                  <div className="rounded-full border-2 border-gray-400 w-10 flex items-center justify-center h-full bg-base-100">
                    {isSender ? (
                      currentUser.profilePic ? (
                        <img
                          src={currentUser.profilePic}
                          alt={currentUser.name}
                          className="rounded-full h-12 w-10"
                        />
                      ) : (
                        <InitialsAvatar
                          name={currentUser.name}
                          className="flex h-full w-full items-center justify-center"
                        />
                      )
                    ) : selectedUser.profilePic ? (
                      <img
                        src={selectedUser.profilePic}
                        alt={selectedUser.name}
                        className="rounded-full h-12 w-10"
                      />
                    ) : (
                      <InitialsAvatar
                        name={selectedUser.name}
                        className="flex h-full w-full items-center justify-center"
                      />
                    )}
                  </div>
                </div>

                <div className="chat-footer opacity-50">{dateParser(msg.createdAt)}</div>

                <div
                  className={`${
                    isSender
                      ? "chat-bubble-success text-black text-xl chat-bubble"
                      : "chat-bubble text-white bg-gray-500 text-xl"
                  }`}
                >
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="img"
                      className="sm:max-w-[10rem] md:max-w-[15rem] max-h-[12rem] w-auto rounded-md cursor-pointer"
                      onClick={() => window.open(msg.img)}
                    />
                  )}
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
