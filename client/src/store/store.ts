import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
