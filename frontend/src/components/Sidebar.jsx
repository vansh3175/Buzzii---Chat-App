import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, setSelectedUser, setUsers, addUser } from "../store/chatSlice";
import axios from "axios";
import { Dot } from "lucide-react";
import { getSocket } from "../util/socketInstance";
import InitialsAvatar from 'react-initials-avatar';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';

function Sidebar() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.chat.users);
  const storeSelected = useSelector((state) => state.chat.selectedUser);
  const userData = useSelector(state=>state.auth.userData);
  const activeUsers = useSelector((state) => state.auth.activeUsers);
  const socketStatus = useSelector((state) => state.auth.socketStatus);
  const theme = useSelector(state=>state.theme.theme);

  useEffect(() => {
    const cachedUser = localStorage.getItem("selectedUser");
    if (cachedUser) {
      dispatch(setSelectedUser({ user: JSON.parse(cachedUser) }));
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("user-created", (user) => dispatch(addUser({ user })));
    }
    return () => socket?.off("user-created");
  }, [socketStatus]);

  useEffect(() => {
    if (storeSelected) {
      axios
        .get(`http://localhost:5000/chat/${storeSelected._id}`, {
          withCredentials: true,
        })
        .then((res) => dispatch(setMessages({ messages: res.data.messages })))
        .catch((err) => console.error(err));
    } else {
      dispatch(setMessages({ messages: [] }));
    }
  }, [storeSelected]);

  const changeSelected = (user) => {
    dispatch(setSelectedUser({ user }));
    localStorage.setItem("selectedUser", JSON.stringify(user));
  };

  return (
    <div className="sm:w-1/3 w-fit min-w-20 sm:min-w-50 max-w-80 sm:h-[calc(100vh-5rem)] overflow-y-auto bg-base-100 sm:p-4 py-20 sm:py-4 border-r border-gray-500 overflow-hidden">
      {users.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg h-full flex items-center">
          Your friends will show here 😎
        </div>
      ) : (
        <ul className="bg-base-100 rounded-box w-full">
          {users.map((user) => {
            const isActive = user._id === storeSelected?._id;
            return (
              <li key={user._id} className="w-full">
                <div
                  className={`flex items-center gap-4 py-4 px-2 w-full cursor-pointer rounded transition-all duration-100 ease-in-out
                    ${isActive ? " sm:border-l-8 sm:border-yellow-500 " : "hover:bg-base-300"}
                  `}
                  onClick={() => changeSelected(user)}
                >
                  <div className="avatar relative">
                    
                      <Dot
                        size={64}
                        className={`absolute -bottom-6 -right-6  ${activeUsers.includes(user._id)?"text-green-400":"text-red-600"}`}
                      />
                    
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 ${isActive ? "border-4 border-warning" : ""}`}>
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <InitialsAvatar name={user.name} className="w-full h-full flex items-center justify-center text-3xl"/>
                      )}
                    </div>
                  </div>
                 <div className="hidden sm:flex flex-col overflow-hidden w-full">
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p
                      className={`text-sm overflow-hidden whitespace-nowrap text-ellipsis ${theme=='dark'?"text-gray-200":"text-gray-800"}
                      }`}
                    >
                    {
                      user.lastMsg?(

                        (user._id===user.lastMsg.senderId)?(
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
                <hr className="hidden sm:block text-gray-500" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
