import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    theme:localStorage.getItem('theme') || 'light'
}

const themeSlice = createSlice({
    name:"theme",
    initialState,
    reducers:{
        setTheme:(state,action)=>{
            state.theme=action.payload.theme;
        }
    }
})

export default themeSlice.reducer;

export const {setTheme} = themeSlice.actions;