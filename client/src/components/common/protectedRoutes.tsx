import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRoutesProps {
  children: ReactNode;
  user: object;
}

const ProtectedRoutes = ({ user, children }: ProtectedRoutesProps) => {

  if (
    user === null &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to={"/login"} />;
  }
  return children;
};

export default ProtectedRoutes;
