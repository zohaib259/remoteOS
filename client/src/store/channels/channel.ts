import authApi from "@/utils/axiosIntercepter";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface initialStateTypes {
  isLoading: boolean;
  channelData: Array<string> | null;
}

const initialState: initialStateTypes = {
  isLoading: false,
  channelData: null,
};
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

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createChannel.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createChannel.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createChannel.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default channelSlice.reducer;
