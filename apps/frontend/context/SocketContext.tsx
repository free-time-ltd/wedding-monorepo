"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { io, Socket, SocketOptions } from "socket.io-client";
import type { Transport } from "engine.io-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  connect: (props?: ConnectProps) => void;
  disconnect: (removeListeners?: boolean) => void;
}

interface ConnectProps {
  url?: string;
  options?: Partial<SocketOptions>;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setTransport(socketRef.current?.io.engine.transport.name ?? "N/A");

    socketRef.current?.io.engine.on("upgrade", onUpgrade);
  }, []);

  const onDisconnect = () => {
    setIsConnected(false);
    setTransport("N/A");
  };
  const onUpgrade = (transport: Transport) => {
    setTransport(transport.name);
  };

  const connect = useCallback(
    (props?: ConnectProps) => {
      if (socketRef.current?.connected) return;

      const { url, options } = props ?? {};

      socketRef.current = io(url ?? process.env.NEXT_PUBLIC_WS_SERVER_URL, {
        path: process.env.NEXT_PUBLIC_WS_PATH,
        autoConnect: false,
        withCredentials: true,
        ...options,
      });

      socketRef.current.on("connect", onConnect);
      socketRef.current.on("disconnect", onDisconnect);
      socketRef.current.on("connect_error", console.log);

      socketRef.current.connect();
    },
    [onConnect]
  );

  const disconnect = useCallback((removeListeners?: boolean) => {
    if (socketRef.current) {
      if (removeListeners) {
        socketRef.current.removeAllListeners();
      }

      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        connect,
        disconnect,
        socket: socketRef.current,
        isConnected,
        transport,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
