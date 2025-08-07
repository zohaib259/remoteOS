import authApi from "@/utils/axiosIntercepter";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { type AxiosProgressEvent } from "axios";

interface messagesStatestypes {
  isLoading: boolean;
  isSending: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;
  uploadedPublicId: string | null;
  uploadError: string | null;
  files: File[];
}

export type SignatureResponse = {
  success: boolean;
  message: string;
  timestamp: string;
  signature: string;
  folder: string;
};

const initialState: messagesStatestypes = {
  isLoading: false,
  isSending: true,
  uploadProgress: 0,
  uploadedUrl: null,
  uploadedPublicId: null,
  uploadError: null,
  files: [],
};

type CloudinaryUploadResponse = {
  url: string;
  secure_url: string;
  public_id: string;
  [key: string]: any; // optional fallback
};

//  Get Signature from backend
export const getSignature = createAsyncThunk<
  SignatureResponse,
  void,
  { rejectValue: string }
>("channel/channel/signature", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.get(`/room/channel/signature`);
    return response?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Getting signature"
    );
  }
});

// ☁️ Upload file to Cloudinary
export const uploadToCloudinary = createAsyncThunk<
  CloudinaryUploadResponse,
  {
    file: File;
    signature: SignatureResponse;
    signal?: AbortSignal;
    onProgress: (progress: number) => void;
  },
  { rejectValue: string }
>(
  "channel/cloudinary",
  async ({ file, signature, signal, onProgress }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
    formData.append("timestamp", signature.timestamp);
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    try {
      const url = `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/auto/upload`;

      const response = await axios.post(url, formData, {
        signal,
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            if (onProgress) onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

// Create Messsage
export const createMessage = createAsyncThunk<
  { success: boolean; message: string; data: any },
  {
    channelId: string | null;
    content: string | null;
    mediaUrl: string | null;
    mediaPublicId: string | null;
  },
  { rejectValue: string }
>(
  "/room/channel/messages/send",
  async (
    { channelId, content, mediaUrl, mediaPublicId },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.post(`/room/channel/messages/send`, {
        channelId,
        content,
        mediaUrl,
        mediaPublicId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Create message failed"
      );
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
    },

    clearFiles: (state) => {
      state.files = [];
    },

    addFile: (state, action: PayloadAction<File>) => {
      state.files.push(action.payload);
    },

    removeFileAt: (state, action: PayloadAction<number>) => {
      state.files.splice(action.payload, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSignature.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSignature.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getSignature.rejected, (state) => {
        state.isLoading = false;
      })

      // uploadToCloudinary
      .addCase(uploadToCloudinary.pending, (state) => {
        state.uploadProgress = 0;
        state.uploadedUrl = null;
        state.uploadError = null;
      })
      .addCase(uploadToCloudinary.fulfilled, (state, action) => {
        state.uploadedUrl = action.payload.url;
        state.uploadedPublicId = action.payload.public_id;
        state.uploadProgress = 100;
      })
      .addCase(uploadToCloudinary.rejected, (state, action) => {
        state.uploadError = action.payload || "Upload failed";
      })

      // createMessage
      .addCase(createMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(createMessage.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(createMessage.rejected, (state) => {
        state.isSending = true;
      });
  },
});

export const { setFiles, clearFiles, addFile, removeFileAt } =
  messagesSlice.actions;
export default messagesSlice.reducer;
