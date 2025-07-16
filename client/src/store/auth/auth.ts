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
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isCheckingAuth: true,
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
    return rejectWithValue(
      error.response?.data || "Registration failed. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data || "Invalid OTP. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data || "Failed to resend OTP. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data || "Invalid email or password. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data ||
        "Failed to send reset password token. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data || "Failed to update password. Please try again."
    );
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
    return rejectWithValue(
      error.response?.data || "Google login failed. Please try again."
    );
  }
});

// check auth

export const checkAuth = createAsyncThunk<
  { success: boolean; message: string; user: string },
  void,
  { rejectValue: string }
>("/auth/check-auth", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/auth/check-auth",
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.get(
          "http://localhost:3000/api/auth/refresh-token",
          {
            withCredentials: true,
          }
        );

        if (refreshRes.status === 201) {
          const retryRes = await axios.get(
            "http://localhost:3000/api/auth/check-auth",
            {
              withCredentials: true,
            }
          );

          return retryRes.data;
        }
      } catch (refreshError: any) {
        return rejectWithValue(
          refreshError.response?.data || "Session expired. Please log in again."
        );
      }
    }

    return rejectWithValue(
      error.response?.data || "Authentication check failed. Please try again."
    );
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
        state.error =
          action.payload || "Registration failed. Please try again.";
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
        state.error = action.payload || "Invalid OTP. Please try again.";
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
        state.error =
          action.payload || "Failed to resend OTP. Please try again.";
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
        state.error =
          action.payload || "Invalid email or password. Please try again.";
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
        state.error =
          action.payload ||
          "Failed to send reset password token. Please try again.";
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
        state.error =
          action.payload || "Failed to update password. Please try again.";
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
        state.error =
          action.payload || "Google login failed. Please try again.";
      })

      // check auth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.user = action?.payload?.user;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.error =
          action.payload || "Google login failed. Please try again.";
      });
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
