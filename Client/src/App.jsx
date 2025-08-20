import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Redux/store';

import RequireAuth from "/src/Components/Auth/RequireAuth.jsx"; // Chemin absolu
import AboutUs from './Pages/AboutUs.jsx';
import Contact from './Pages/Contact.jsx';
import CourseDescription from './Pages/Course/CourseDescription.jsx';
import CourseList from './Pages/Course/CourseList.jsx';
import CreateCourse from './Pages/Course/CreateCourse.jsx';
import EditCourse from './Pages/Course/EditCourse.jsx';
import Denied from './Pages/Denied.jsx';
import AddCourseLectures from './Pages/Deshboard/AddLectures.jsx';
import AdminDashboard from "./Pages/Deshboard/AdminDeshboard.jsx"; // Remplace AdminDashboard par AdminDeshboard
import DisplayLectures from './Pages/Deshboard/DisplayLectures.jsx';
import HomePage from './Pages/HomePage.jsx';
import Login from './Pages/Login.jsx';
import NotFound from './Pages/NotFound.jsx';
import ChangePassword from './Pages/Password/ChangePassword.jsx';
import ForgetPassword from './Pages/Password/ForgetPassword.jsx';
import ResetPassword from './Pages/Password/ResetPassword.jsx';
import CheckoutPage from './Pages/Payment/Checkout.jsx';
import CheckoutFailure from './Pages/Payment/CheckoutFailure.jsx';
import CheckoutSuccess from './Pages/Payment/CheckoutSuccess.jsx';
import Signup from './Pages/Signup.jsx';
import EditProfile from './Pages/User/EditProfile.jsx';
import Profile from './Pages/User/Profile.jsx';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/denied" element={<Denied />} />
        <Route path="/course/description" element={<CourseDescription />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/addlecture" element={<AddCourseLectures />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Corrige 'deshboard' */}
        </Route>

        <Route element={<RequireAuth allowedRoles={["ADMIN", "USER"]} />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/editprofile" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/fail" element={<CheckoutFailure />} />
          <Route path="/course/displaylecture" element={<DisplayLectures />} />
          {/* Supprime le doublon /course/edit ici */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Provider>
  );
}

export default App;