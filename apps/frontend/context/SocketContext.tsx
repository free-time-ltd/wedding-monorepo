"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  io,
  TypedClientSocket as Socket,
  SocketOptions,
} from "@repo/socket/client";
import type { Transport } from "engine.io-client";
import { useChatStore } from "@/store/chatStore";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  connect: (props?: ConnectProps) => void;
  disconnect: (removeListeners?: boolean) => void;
  reconnect: () => void;
}

interface ConnectProps {
  url?: string;
  options?: Partial<SocketOptions>;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const lastConnectProps = useRef<ConnectProps | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const { setUnreadMessages } = useChatStore();

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setTransport(socketRef.current?.io.engine.transport.name ?? "N/A");

    socketRef.current?.io.engine.on("upgrade", onUpgrade);
    socketRef.current?.emit("get-unreads", function (unreads) {
      setUnreadMessages(
        Object.fromEntries(
          unreads.map((record) => [record.roomId, record.unreadCount])
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      lastConnectProps.current = props;
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

  const reconnect = useCallback(() => {
    if (!isConnected) return;
    disconnect(false);
    connect(lastConnectProps.current);
  }, [connect, disconnect, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        connect,
        disconnect,
        reconnect,
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
