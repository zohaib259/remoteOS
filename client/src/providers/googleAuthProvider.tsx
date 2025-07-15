// src/providers/GoogleAuthProvider.tsx
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const GoogleAuthProvider = ({ children }: Props) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;
