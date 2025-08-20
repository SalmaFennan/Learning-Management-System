import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance";
const initialState = {
  key: "",
  subscription_id: "",
  isPaymentVerified: false,
  allPayments: {},
  finalMonths: {},
  monthlySalesRecord: [],
  loading: false,
  error: null,
};

export const getRazorPayId = createAsyncThunk("/razorpay/getId", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/payments/razorpay-key");
    return response.data;
  } catch (error) {
    toast.error("Failed to load Razorpay key");
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const purchaseCourseBundle = createAsyncThunk("/purchaseCourse", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/payments/subscribe");
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to purchase course bundle");
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const verifyUserPayment = createAsyncThunk("/payments/verify", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/payments/verify", {
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_subscription_id: data.razorpay_subscription_id,
      razorpay_signature: data.razorpay_signature,
    });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to verify payment");
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const getPaymentRecord = createAsyncThunk("/payments/record", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/payments?count=100");
    toast.promise(response, {
      loading: "Getting the payment records...",
      success: (data) => data?.data?.message || "Payment records loaded",
      error: "Failed to get payment records",
    });
    return (await response).data;
  } catch (error) {
    toast.error("Operation failed");
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const cancelCourseBundle = createAsyncThunk("/payments/cancel", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/payments/unsubscribe");
    toast.promise(response, {
      loading: "Unsubscribing the bundle...",
      success: (data) => data?.data?.message || "Unsubscribed successfully",
      error: "Failed to unsubscribe",
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to unsubscribe");
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

const razorpaySlice = createSlice({
  name: "razorpay",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRazorPayId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRazorPayId.fulfilled, (state, action) => {
        state.loading = false;
        state.key = action?.payload?.key || "";
      })
      .addCase(getRazorPayId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(purchaseCourseBundle.pending, (state) => {
        state.loading = true;
      })
      .addCase(purchaseCourseBundle.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription_id = action?.payload?.subscription_id || "";
      })
      .addCase(purchaseCourseBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyUserPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUserPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.isPaymentVerified = action?.payload?.success || false;
        if (action.payload.message) toast.success(action.payload.message);
      })
      .addCase(verifyUserPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPaymentVerified = false; // Réinitialise en cas d'échec
      })
      .addCase(getPaymentRecord.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.allPayments = action?.payload?.allPayments || {};
        state.finalMonths = action?.payload?.finalMonths || {};
        state.monthlySalesRecord = action?.payload?.monthlySalesRecord || [];
      })
      .addCase(getPaymentRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelCourseBundle.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelCourseBundle.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription_id = ""; // Réinitialise l'abonnement
      })
      .addCase(cancelCourseBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default razorpaySlice.reducer;