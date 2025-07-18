import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authApi from "../../utils/axiosIntercepter";

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
    const response = await authApi.post("/room/create", formData);
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
        state.isLoading = true;
      })
      .addCase(createCollabRoom.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCollabRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Creating collab room failed";
      });
  },
});

export default collabRoomSlice.reducer;
