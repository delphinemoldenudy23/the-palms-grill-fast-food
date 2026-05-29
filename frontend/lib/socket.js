import { io } from "socket.io-client";
import { getApiUrl } from "./getApiUrl";

let socket = null;

export function initSocket(customerPhone = null) {
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
    console.log("🔌 Socket connected:", socket.id);
    
    if (customerPhone) {
      socket.emit("join-customer", customerPhone);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
