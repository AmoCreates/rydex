import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Keep an in-memory set of joined ride rooms and persist to sessionStorage
const JOINED_RIDES_KEY = "joinedRides";

const loadJoinedRides = (): string[] => {
  try {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(JOINED_RIDES_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveJoinedRides = (ids: string[]) => {
  try {
    if (typeof window !== "undefined") sessionStorage.setItem(JOINED_RIDES_KEY, JSON.stringify(ids));
  } catch (e) {
    // ignore
  }
};

export const getSocket = (): Socket | null => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      autoConnect: true,
      // allow polling as a fallback when websocket is unavailable
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // track rides the client has joined so we can re-join after reconnect
    const joinedRides = new Set<string>(loadJoinedRides());

    // intercept emit to persist 'join-ride' requests
    const originalEmit = (socket as any).emit.bind(socket as any);
    (socket as any).emit = (...args: any[]) => {
      try {
        const [event, payload] = args;
        if (event === "join-ride" && typeof payload === "string") {
          joinedRides.add(payload);
          saveJoinedRides(Array.from(joinedRides));
        }
        if (event === "leave-ride" && typeof payload === "string") {
          joinedRides.delete(payload);
          saveJoinedRides(Array.from(joinedRides));
        }
      } catch (e) {
        // ignore
      }
      return originalEmit(...args);
    };

    socket.on("connect", () => {
      // restore identity
      const storedUserId = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
      if (storedUserId) {
        socket?.emit("identity", storedUserId);
      }

      // re-join previously joined ride rooms after reconnect
      try {
        const persisted = loadJoinedRides();
        persisted.forEach((rid) => {
          socket?.emit("join-ride", rid);
        });
      } catch (e) {
        // ignore
      }
    });

    socket.on("reconnect", (attempt) => {
      console.log("socket reconnected after", attempt, "attempt(s)");
    });

    socket.on("connect_error", (err) => {
      console.warn("socket connect_error", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("socket disconnected", reason);
    });
  }

  return socket;
};
