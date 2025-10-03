import { ReactNode } from "react";
import { SocketProvider } from "./SocketContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
