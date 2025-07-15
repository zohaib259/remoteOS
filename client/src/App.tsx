import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Register } from "./pages/auth/register";
import { Login } from "./pages/auth/login";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/auth/otp";
import Test from "./pages/dumy/test";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/PasswordResetForm";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuth from "./components/common/googleAuth";

function App() {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            background: "white",
            color: "green",
            borderRadius: "10px",
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<ResetPasswordPage />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
