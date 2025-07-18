import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Register } from "./pages/auth/register";
import { Login } from "./pages/auth/login";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/auth/otp";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/PasswordResetForm";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "./store/store";
import { checkAuth } from "./store/auth/auth";
import { useSelector } from "react-redux";
import { HashLoader } from "react-spinners";
import ProtectedRoutes from "./components/common/protectedRoutes";
import GetStarted from "./pages/get-started/getStarted";
import NotFoundPage from "./pages/404/404";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isCheckingAuth, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <HashLoader size={40} color={"#065b56"} />
      </div>
    );
  }

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

          <Route
            path="/get-started"
            element={
              <ProtectedRoutes user={user}>
                <GetStarted />
              </ProtectedRoutes>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
