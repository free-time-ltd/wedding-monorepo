import { useSocket } from "@/context/SocketContext";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { useEffect, useState } from "react";

export function NetworkIndicator() {
  const { socket } = useSocket();
  const [ping, setPing] = useState<number | null>(null);

  const connected = Boolean(socket?.connected);

  useEffect(() => {
    if (!socket) return;

    const pingHandler = () => {
      const startTime = Date.now();
      socket.emit("ping", () => {
        setPing(Date.now() - startTime);
      });
    };

    const intervalId = setInterval(pingHandler, 5000);

    // Initial ping
    pingHandler();

    return () => {
      clearInterval(intervalId);
    };
  }, [socket]);

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={`size-3 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          } animate-pulse`}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {connected ? "Connected" : "Disconnected"}
          <br />
          Ping: {ping !== null ? `${ping} ms` : "-- ms"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
