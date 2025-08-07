import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import GoogleAuthProvider from "./providers/googleAuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import { socketContext } from "./context/socketContext.ts";
import socket from "./utils/socket.ts";

createRoot(document.getElementById("root")!).render(
  <>
    <Provider store={store}>
      <GoogleAuthProvider>
        <BrowserRouter>
          <socketContext.Provider value={socket}>
            <App />
          </socketContext.Provider>
        </BrowserRouter>
      </GoogleAuthProvider>
    </Provider>
  </>
);
