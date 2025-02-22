import { configureStore } from '@reduxjs/toolkit';
import userReucder from './UserSlice';

const store = configureStore({
  reducer: {
    user: userReucder,
  },
});

export default store;
