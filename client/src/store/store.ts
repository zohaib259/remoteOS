import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import collabRoomReducer from "./collabRoom/collabRoom";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    collaRoom: collabRoomReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
