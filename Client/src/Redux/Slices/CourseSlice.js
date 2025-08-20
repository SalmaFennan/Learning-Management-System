import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance";
const initialState = {
  courseData: [],
  loading: false,
  error: null,
};

export const getAllCourse = createAsyncThunk("/course/get", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/course");
    toast.promise(response, {
      loading: "Loading course data...",
      success: "Courses loaded successfully",
      error: "Failed to get the courses",
    });
    return (await response).data.courses;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const createNewCourse = createAsyncThunk("/course/create", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("title", data?.title);
    formData.append("description", data?.description);
    formData.append("category", data?.category);
    formData.append("createdBy", data?.createdBy);
    if (data?.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await axiosInstance.post("/course", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.promise(response, {
      loading: "Creating new course...",
      success: "Course created successfully",
      error: "Failed to create course",
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const deleteCourse = createAsyncThunk("/course/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/course/${id}`);
    toast.promise(response, {
      loading: "Deleting course data...",
      success: "Course deleted successfully",
      error: "Failed to delete the course",
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

export const updateCourse = createAsyncThunk("/course/update", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("createdBy", data.createdBy);
    formData.append("description", data.description);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await axiosInstance.put(`/course/${data.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.promise(response, {
      loading: "Updating the course...",
      success: "Course updated successfully",
      error: "Failed to update course",
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message || "Unknown error");
  }
});

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.courseData = [...action.payload];
        }
      })
      .addCase(getAllCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.course) {
          state.courseData.push(action.payload.course); // Ajoute le nouveau cours
        }
      })
      .addCase(createNewCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.courseData = state.courseData.filter((course) => course._id !== action.meta.arg); // Supprime le cours par ID
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.course) {
          state.courseData = state.courseData.map((course) =>
            course._id === action.payload.course._id ? action.payload.course : course
          ); // Met à jour le cours
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default courseSlice.reducer;