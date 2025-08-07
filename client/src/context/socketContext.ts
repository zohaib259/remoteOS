import { createContext, useContext } from "react";
import socket from "../utils/socket";

export const socketContext = createContext(socket);

export const useSocket = () => useContext(socketContext);
