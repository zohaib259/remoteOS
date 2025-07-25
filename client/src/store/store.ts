import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import collabRoomReducer from "./collabRoom/collabRoom";
import channelReducer from "./channels/channel";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    collaRoom: collabRoomReducer,
    channel: channelReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
