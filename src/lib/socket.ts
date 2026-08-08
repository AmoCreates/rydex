import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      autoConnect: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      const storedUserId = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
      if (storedUserId) {
        socket?.emit("identity", storedUserId);
      }
    });
  }

  return socket;
};
