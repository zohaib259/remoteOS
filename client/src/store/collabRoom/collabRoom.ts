import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authApi from "../../utils/axiosIntercepter";

interface roomStates {
  isFetchingRoom: boolean;
  isLoading: boolean;
  roomData: any; // You can change 'any' to a specific type if you know the structure
  error: string | null;
}

const initialState: roomStates = {
  isFetchingRoom: true,
  isLoading: false,
  roomData: null,
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
>("room/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await authApi.post("/room/create", formData);
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Creating collab room failed"
    );
  }
});

// Get collab room
export const getCollabRomm = createAsyncThunk<
  { success: boolean; message: string; data: any }, // Add expected 'data'
  void,
  { rejectValue: string }
>("room/get", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.get("/room/get");
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Getting collab room failed"
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
        state.error = null;
      })
      .addCase(createCollabRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.roomData = action.payload.message;
      })
      .addCase(createCollabRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Creating collab room failed";
      })

      // Get collab room
      .addCase(getCollabRomm.pending, (state) => {
        state.isFetchingRoom = true;
        state.error = null;
      })
      .addCase(getCollabRomm.fulfilled, (state, action) => {
        state.isFetchingRoom = false;
        state.error = null;
        state.roomData = action.payload.data;
      })
      .addCase(getCollabRomm.rejected, (state, action) => {
        state.isFetchingRoom = false;
        state.error = action.payload || "Getting collab room failed";
      });
  },
});

export default collabRoomSlice.reducer;
