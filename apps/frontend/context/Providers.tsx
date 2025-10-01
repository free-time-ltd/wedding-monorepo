import { ReactNode } from "react";
import { SocketProvider } from "./SocketContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider url="ws://localhost:8080/ws">{children}</SocketProvider>
  );
}
