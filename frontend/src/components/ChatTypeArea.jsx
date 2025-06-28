import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LucideSendHorizonal, Image } from "lucide-react";
import axios from "axios";
import { setMessages, setMessageSending, setUsers } from "../store/chatSlice";
import {motion,AnimatePresence} from 'framer-motion'
import { XCircle } from "lucide-react";
import { getSocket } from "../util/socketInstance";


function ChatTypeArea() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview,setPreview] = useState();
  const messageSendingStatus = useSelector(state=>state.chat.messageSending);

  const dispatch = useDispatch();

  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const selectedUserId = selectedUser._id;
  const messages = useSelector((state) => state.chat.messages);
  const users = useSelector((state)=>state.chat.users);
  const theme = useSelector((state) => state.theme.theme); // 'dark' or 'light'

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!text && !file) return;

    


    const formData = new FormData()
    if(text) formData.append("text",text);
    if(file) formData.append("image",file);

    dispatch(setMessageSending({status:true}));

    axios
      .post(
        `http://localhost:5000/chat/${selectedUserId}`,
        formData,
        {
          headers:
            {
              "content-type": "multipart/form-data"
            }
          ,
          
          withCredentials: true }
      )
      .then((res) => {
        console.log(res.data);
        setText("");
        setFile(null);
        setPreview(null);
        dispatch(setMessages({ messages: [...messages, res.data.chat] }));
        dispatch(setMessageSending({status:false}));
        const updateUsers = users.map((user)=>{
          if(user._id!==selectedUser._id) return user;
          else return {...user,lastMsg:res.data.chat}
        });
        
        dispatch(setUsers({users:updateUsers}));
        if(getSocket()){
          
          getSocket().emit('send-message',res.data.chat);
        }
        dispatch(setMessageSending({status:false}));

      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="relative w-full">

  
      {preview && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-14 left-3 z-20"
          > 
          <XCircle color="red" className="absolute top-0 right-0 cursor-pointer" onClick={()=>{
            setPreview(null);
            setFile(null);
          }} />
            <img
              src={preview}
              alt="preview"
              className="max-w-[150px] max-h-[120px] rounded-md shadow-lg"
              
            />
          </motion.div>
        </AnimatePresence>

      )}

      
      <div className="w-full bg-base-100 h-12 z-10">
        <form onSubmit={handleSubmit} className="flex items-center h-full px-2">
          <label htmlFor="fileUpload" className="px-3 cursor-pointer">
            <Image />
          </label>
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={(e) => {
            const selected = e.target.files[0];

            if (selected) {
              const validTypes = ["image/jpeg", "image/jpg", "image/png"];
              const validExtensions = [".jpg", ".jpeg", ".png"];
              const fileExtension = selected.name.slice(selected.name.lastIndexOf(".")).toLowerCase();

              if (!validTypes.includes(selected.type) || !validExtensions.includes(fileExtension)) {
                alert("Please select a JPG, JPEG, or PNG image");
                return;
              }

              setFile(selected);
              setPreview(URL.createObjectURL(selected));
            }
          }}

          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className={`flex-1 focus:outline-none bg-transparent ${theme=='dark'?"caret-amber-50":"caret-black"}`}
          />
          <button type="submit" className="px-3 cursor-pointer "
          disabled={messageSendingStatus}
          >
            <LucideSendHorizonal />
          </button>
        </form>
      </div>

    </div>

          
          
        
      );
}

export default ChatTypeArea;
