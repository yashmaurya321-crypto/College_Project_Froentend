// redux/UserSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;  
      console.log('user set')
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;