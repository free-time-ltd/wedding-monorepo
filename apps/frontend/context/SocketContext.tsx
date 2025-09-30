"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";

type SocketType = typeof Socket;
type SocketContextType = {
  socket: SocketType | null;
  isConnected: boolean;
  transport: string;
};

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  url: string;
  options?: Parameters<typeof io>[0];
}

export const SocketProvider = ({
  url,
  children,
  options = {},
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    const newSocket: SocketType = io(url, options);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setTransport("N/A");
    };

    setSocket(newSocket);

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.disconnect();
    };
  }, [url, options]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, transport }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
