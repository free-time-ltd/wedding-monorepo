"use client";

import { ReactNode } from "react";
import { SocketProvider } from "./SocketContext";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { MessageNotificationProvider } from "./MessageNotificationProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <MessageNotificationProvider>{children}</MessageNotificationProvider>
      <Toaster />
    </SocketProvider>
  );
}
