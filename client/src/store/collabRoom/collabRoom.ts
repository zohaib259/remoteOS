import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface roomStates {
  isLoading: boolean | null;
  error: string | null;
}

const initialState: roomStates = {
  isLoading: false,
  error: null,
};

// Create collab room
export const createCollabRoom = createAsyncThunk<
  { success: boolean; message: string },
  {
    companyName: string;
    userName: string;
    teamMembers: string[];
    userId: number;
  },
  { rejectValue: string }
>("/room/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/room/create",
      formData,
      { withCredentials: true }
    );
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Creating collab room failed"
    );
  }
});

const collabRoomSlice = createSlice({
  name: "collabRoom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create collab room
      .addCase(createCollabRoom.pending, (state) => {
        state.isLoading = false;
      })
      .addCase(createCollabRoom.fulfilled, (state) => {
        state.isLoading = true;
      })
      .addCase(createCollabRoom.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default collabRoomSlice.reducer;
