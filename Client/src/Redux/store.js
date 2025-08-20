import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./Slices/AuthSlice";
import courseReducer from "./Slices/CourseSlice";
import lectureReducer from "./Slices/LectureSlice";
import razorpayReducer from "./Slices/RazorpaySlice";
import statReducer from "./Slices/StatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    razorpay: razorpayReducer,
    lecture: lectureReducer,
    stat: statReducer,
  },
  devTools: true,
});
export default store;