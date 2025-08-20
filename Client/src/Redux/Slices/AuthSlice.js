import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance";

const isBrowser = typeof window !== "undefined"; 

const safeParse = (value, fallback) => {
  try { 
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const initialState = {
  isLoggedIn: isBrowser ? localStorage.getItem("isLoggedIn") === "true" : false,
  role: isBrowser ? localStorage.getItem("role") || "" : "",
  data: isBrowser ? safeParse(localStorage.getItem("data"), {}) : {},
  loading: false,
  error: null,
};

export const createAccount = createAsyncThunk("/auth/signup", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("user/register", data);
    toast.promise(res, {
      loading: "Wait, creating your account...",
      success: (data) => data?.data?.message,
      error: "Failed to create account",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const login = createAsyncThunk("/auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("user/login", data);
    toast.promise(res, {
      loading: "Wait, authentication in process...",
      success: (data) => data?.data?.message,
      error: "Failed to login",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const logout = createAsyncThunk("/auth/logout", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("user/logout");
    toast.promise(res, {
      loading: "Wait, logout in process...",
      success: (data) => data?.data?.message,
      error: "Failed to logout",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const updateProfile = createAsyncThunk("/user/update/profile", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put("user/update", data);
    toast.promise(res, {
      loading: "Wait, profile update in process...",
      success: (data) => data?.data?.message,
      error: "Failed to update profile",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const getUserData = createAsyncThunk("/user/details", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("user/me");
    return (await res).data;
  } catch (error) {
    toast.error(error?.message);
    return rejectWithValue(error?.message || "Unknown error");
  }
});

export const forgetPassword = createAsyncThunk("/auth/forget-password", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("user/reset", data);
    toast.promise(res, {
      loading: "Wait, forget password in process...",
      success: (data) => data?.data?.message,
      error: "Failed to forget password",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const changePassword = createAsyncThunk("/auth/change-password", async (userPassword, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("user/change-password", userPassword);
    toast.promise(res, {
      loading: "Wait, changing password in process...",
      success: (data) => data?.data?.message,
      error: "Failed to change password",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const resetPassword = createAsyncThunk("/user/reset", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`user/reset/${data.resetToken}`, { password: data.password });
    toast.promise(res, {
      loading: "Wait, resetting password in process...",
      success: (data) => data?.data?.message,
      error: "Failed to reset password",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.role = action.payload.user?.role || "";
        state.data = action.payload.user || {};
        localStorage.setItem("data", JSON.stringify(state.data));
        localStorage.setItem("isLoggedIn", state.isLoggedIn);
        localStorage.setItem("role", state.role);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.role = action.payload.user?.role || "";
        state.data = action.payload.user || {};
        localStorage.setItem("data", JSON.stringify(state.data));
        localStorage.setItem("isLoggedIn", state.isLoggedIn);
        localStorage.setItem("role", state.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        localStorage.clear();
        state.data = {};
        state.isLoggedIn = false;
        state.role = "";
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.role = action.payload.user?.role || "";
        state.data = action.payload.user || {};
        localStorage.setItem("data", JSON.stringify(state.data));
        localStorage.setItem("isLoggedIn", state.isLoggedIn);
        localStorage.setItem("role", state.role);
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = { ...state.data, ...action.payload.user } || {};
        localStorage.setItem("data", JSON.stringify(state.data));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.loading = false;
        // Pas de mise à jour d'état majeur ici, juste une confirmation
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        // Pas de mise à jour d'état majeur, juste une confirmation
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        // Si le reset réussit, tu peux mettre à jour l'état ou forcer un login
        state.isLoggedIn = true; // Optionnel, selon ta logique
        state.data = action.payload.user || state.data;
        localStorage.setItem("data", JSON.stringify(state.data));
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;