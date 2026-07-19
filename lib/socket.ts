import { io, type Socket } from "socket.io-client";
import { getApiBase } from "./api/client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getApiBase(), {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
