import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
import { AuthState, User } from "../../types";

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

interface LoginResponse {
  access: string;
  refresh?: string;
  message?: string;
  success?: boolean;
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await api.post("/login", { username, password });

    // Token is stored ONLY in Redux state, not in localStorage
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.response ||
      error.response?.data?.detail ||
      "Login failed";
    return rejectWithValue(errorMessage);
  }
});

export const register = createAsyncThunk<
  User,
  RegisterData,
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.detail || "Registration failed",
    );
  }
});

export const fetchProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid, but we don't clear localStorage anymore
      // The refresh interceptor will handle it
    }
    return rejectWithValue(
      error.response?.data?.detail || "Failed to fetch profile",
    );
  }
});

export const updateProfile = createAsyncThunk<
  User,
  FormData | Partial<User>,
  { rejectValue: string }
>("auth/updateProfile", async (userData, { rejectWithValue }) => {
  try {
    const config: any = {};

    if (userData instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.patch("/profile", userData, config);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.detail || "Failed to update profile",
    );
  }
});

export const refreshToken = createAsyncThunk<
  { access: string },
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    // Refresh token is automatically sent via cookie
    const response = await api.post("/token/refresh", {});

    // Token is stored in Redux state automatically via extraReducers
    return response.data;
  } catch (error: any) {
    return rejectWithValue("Session expired. Please login again.");
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/logout", {});
    } catch (error) {
      // Even if logout fails, we still want to clear local state
      console.error("Logout API failed:", error);
    }
  },
);

// Add deleteAccount thunk
export const deleteAccount = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/deleteAccount", async (_, { rejectWithValue }) => {
  try {
    // Call the delete account endpoint
    const response = await api.delete("/profile");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Failed to delete account";
    return rejectWithValue(errorMessage);
  }
});

export const hydrateAuth = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/hydrate", async (_, { dispatch, rejectWithValue }) => {
  try {
    // Try to refresh token first (will work if refresh cookie exists)
    await dispatch(refreshToken()).unwrap();
    // Then fetch profile with new token
    await dispatch(fetchProfile()).unwrap();
  } catch (error) {
    // No token in storage to fallback to
    return rejectWithValue("No active session");
  }
});

export const changePassword = createAsyncThunk<
  void,
  { old_password: string; new_password: string },
  { rejectValue: string }
>(
  "auth/changePassword",
  async ({ old_password, new_password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/change-password", {
        old_password,
        new_password,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to change password";
      return rejectWithValue(errorMessage);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        // Note: Registration doesn't set token, user needs to login
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // Still clear state even if logout API fails
        state.user = null;
        state.token = null;
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete account";
      })
      // Hydrate
      .addCase(hydrateAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(hydrateAuth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      }) // Change Password
      .addCase(changePassword.pending, (state) => {
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { clearError, setAuthState } = authSlice.actions;
export default authSlice.reducer;
