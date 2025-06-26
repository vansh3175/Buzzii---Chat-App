import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status:false,
    userData:null,
    loading:true,
    activeUsers:[],
    socketStatus:false
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.status=true;
            state.userData=action.payload.userData
            state.loading=false;
        },
        logout:(state,action)=>{
            state.status=false;
            state.userData=null;
            state.loading=false;

        },
        setProfile: (state, action) => {
            state.userData = action.payload.userData
        },
        setLoading:(state,action)=>{
            state.loading=action.payload.loading;
        },
        setActiveUsers:(state,action)=>{
            state.activeUsers=action.payload.users;
        },
        setSocketStatus:(state,action)=>{
            state.socketStatus=action.payload.status;
        }
        
    }
})

export default authSlice.reducer;

export const {login,logout,setLoading,setActiveUsers,setSocketStatus,setProfile} = authSlice.actions;