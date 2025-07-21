import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRoutesProps {
  children: ReactNode;
  user?: object;
  roomData?: object;
}

const ProtectedRoutes = ({
  user,
  children,
  roomData,
}: ProtectedRoutesProps) => {
  if (
    user === null &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to={"/login"} />;
  }

  if (
    user === null ||
    ((!roomData || roomData === null) &&
      location.pathname.includes("/collab-room"))
  ) {
    return <Navigate to={"/get-started"} />;
  }

  return children;
};

export default ProtectedRoutes;
