import ForgotPassword from "@/pages/auth/forgot-password";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// User type
interface User {
  name: string;
  email: string;
  role: string;
  success: boolean;
  message: string;
  user: object;
}

// Auth slice state type
interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Register thunk
export const registerUser = createAsyncThunk<
  { success: boolean; message: string },
  { name: string; email: string; password: string }, // Arg type
  { rejectValue: string }
>("/auth/register", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Registration failed");
  }
});

// Verify OTP thunk
export const verifyOtp = createAsyncThunk<
  { success: boolean; message: string }, // Return type
  { email: string; otp: number }, // Arg type
  { rejectValue: string }
>("/auth/verify-otp", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/verify-otp",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Verification failed");
  }
});

// Resend OTP thunk
export const resendOtp = createAsyncThunk<
  {
    success: boolean;
    message: string;
    user: string;
  },
  {
    email: string;
  },
  { rejectValue: string }
>("verify-otp/resend", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/verify-otp/resend",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Verification failed");
  }
});

// Login
export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("/auth/login", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/login",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Verification failed");
  }
});

// forgot password
export const forgotPassword = createAsyncThunk<
  {
    success: boolean;
    message: string;
  },
  {
    email: string;
  },
  {
    rejectValue: string;
  }
>("/auth/send-reset-pass-token", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/send-reset-pass-token",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Verification failed");
  }
});

// new password
export const newPassword = createAsyncThunk<
  {
    success: boolean;
    message: string;
  },
  {
    token: string;
    password: string;
  },
  {
    rejectValue: string;
  }
>("/auth/new-password", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/new-password",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Verification failed");
  }
});

// google login
export const LoginWithgoogle = createAsyncThunk<
  {
    success: boolean;
    message: string;
  },
  { code: string },
  { rejectValue: string }
>("/auth/google", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/google-login",
      formData,
      { withCredentials: true }
    );

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "google login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
      })

      // verify otp
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      })

      // verify otp
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      })

      // verify otp
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action?.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      })

      // verify otp
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      })
      // new password
      .addCase(newPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(newPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(newPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      })
      // google login
      .addCase(LoginWithgoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(LoginWithgoogle.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(LoginWithgoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
