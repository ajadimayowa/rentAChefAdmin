// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

// Define interfaces for clarity and type safety
interface IUserData {
  userProfile : {
  id:string,
  fullName: string;
  email: string;
  role:string
  }
}


// Initial state
const initialState: IUserData = {
  userProfile: {
  id:'',
  fullName: '',
  email: '',
  role:''
  
  }
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<any>) => {
      console.log({ dispatched: action.payload })
      state.userProfile = action.payload;
    },
    logout: (state) => {
      // Reset the state to initial on logout
      state.userProfile = initialState.userProfile;
      localStorage.removeItem('token');
    },
  },
});

// Actions
export const { setUserData, logout } = authSlice.actions;

// Selector
export const selectUserProfile = (state: RootState) => state.auth.userProfile;

// Reducer
export default authSlice.reducer;
