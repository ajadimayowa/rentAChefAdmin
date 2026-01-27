// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

interface ICategory {
  "name": string,
  "description": string,
  "image": string,
  "isActive": boolean,
  "services": string[],
  "createdAt": string,
  "updatedAt": string,
  "slug": string,
  "id": string,
}

interface IService {
  "name": string,
  "description": string,
  "image": string,
  "isActive": boolean,
  "services": string[],
  "createdAt": string,
  "updatedAt": string,
  "slug": string,
  "id": string,
}

// Define interfaces for clarity and type safety
interface IStatics {
  categories: ICategory[],
  services: IService[],

}


// Initial state
const initialState: IStatics = {
  categories: [],
  services: []
}


// Slice
const staticSlice = createSlice({
  name: 'statics',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<any>) => {
      console.log({ dispatched: action.payload })
      state.categories = action.payload;
    },
    setServices: (state, action: PayloadAction<any>) => {
      console.log({ dispatched: action.payload })
      state.services = action.payload;
    }
  },
});

// Actions
export const { setCategories,setServices } = staticSlice.actions;

// Selector
export const selectUserProfile = (state: RootState) => state.auth.userProfile;

// Reducer
export default staticSlice.reducer;
