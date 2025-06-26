import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    selectedUser: null,
    messages: [],
    messageSending:false,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload.users;
        },
        addUser: (state, action) => {
            state.users.push(action.payload.user);
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload.user;
        },
        setMessages: (state, action) => {
            state.messages = action.payload.messages;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload.msg);
        },
        setMessageSending:(state,action)=>{
            state.messageSending=action.payload.status;
        }
    },
});

export default chatSlice.reducer;

export const { setUsers, addUser, setSelectedUser, setMessages, addMessage,setMessageSending } = chatSlice.actions;
