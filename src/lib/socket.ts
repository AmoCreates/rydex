import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  // 1. Check if running in the browser (client-side)
  const isBrowser = typeof window !== "undefined";

  if (!socket && isBrowser) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false, // Recommended: manually .connect() inside useEffect
    });
  }
  
  return socket;
};
