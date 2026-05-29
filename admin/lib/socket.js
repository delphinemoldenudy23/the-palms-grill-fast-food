import { io } from "socket.io-client";
import { getApiUrl } from "./getApiUrl";

let socket = null;

export function initAdminSocket() {
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = getApiUrl();
  const socketUrl = apiUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  const protocol = apiUrl.startsWith("https") ? "https" : "http";

  socket = io(`${protocol}://${socketUrl}`, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("🔌 Admin socket connected:", socket.id);
    socket.emit("join-admin");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Admin socket disconnected");
  });

  return socket;
}

export function getAdminSocket() {
  return socket;
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
