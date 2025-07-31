import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import collabRoomReducer from "./collabRoom/collabRoom";
import channelReducer from "./channels/channelSlice";
import messageReducer from "./messages/messagesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    collabRoom: collabRoomReducer,
    channel: channelReducer,
    message: messageReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
