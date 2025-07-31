import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
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
import CollabRoom from "./pages/collab-Room/collabRoom";
import { getCollabRomm } from "./store/collabRoom/collabRoom";
import { ChannelLayout } from "./components/layouts/channel/channelLayout";
import Channel from "./pages/channel/channel";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isCheckingAuth, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { roomData, isFetchingRoom } = useSelector(
    (state: RootState) => state.collabRoom
  );

  useEffect(() => {
    dispatch(checkAuth()).then(() => {
      dispatch(getCollabRomm()).then((reposnse) => {
        if (
          typeof reposnse?.payload === "object" &&
          reposnse?.payload?.success === true
        ) {
          navigate("/collab-room/home");
        } else {
          if (
            typeof reposnse?.payload === "object" &&
            reposnse?.payload?.success === true
          ) {
            navigate("/get-started");
          }
        }
      });
    });
  }, []);

  if (isCheckingAuth || isFetchingRoom) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
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
        {/* Nest RoomHome inside CollabRoom using Outlet */}
        <Route
          path="/collab-room"
          element={
            <ProtectedRoutes user={user} roomData={roomData}>
              <CollabRoom />
            </ProtectedRoutes>
          }
        >
          <Route path="home" element={<ChannelLayout />}>
            <Route path=":id" element={<Channel />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
