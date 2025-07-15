import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import GoogleAuthProvider from "./providers/googleAuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </Provider>
  </StrictMode>
);
