import authApi from "@/utils/axiosIntercepter";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface initialStateTypes {
  isLoading: boolean;
  channelData: any | null;
  gettingChannel: boolean;
}

const initialState: initialStateTypes = {
  isLoading: false,
  channelData: null,
  gettingChannel: true,
};

// Create channel
export const createChannel = createAsyncThunk<
  { success: boolean; message: string },
  { channelName: string; visibility: string; members: Array<string> },
  { rejectValue: string }
>("channel/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await authApi.post("/room/channel/create", formData);
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Creating channel failed"
    );
  }
});

// get channel by id
export const getChannel = createAsyncThunk<
  { success: boolean; message: string; data: string },
  {},
  { rejectValue: string }
>("channel/get", async (channelId, { rejectWithValue }) => {
  try {
    const response = await authApi.get(`/room/channel/get/${channelId}`);
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Getting channel");
  }
});

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createChannel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createChannel.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createChannel.rejected, (state) => {
        state.isLoading = false;
      })

      // Get channel
      .addCase(getChannel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gettingChannel = false;
        state.channelData = action?.payload?.data;
      })
      .addCase(getChannel.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default channelSlice.reducer;
