import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { toast } from "@repo/ui";
import { useSocket } from "./SocketContext";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { ServerToClientEvents } from "@repo/socket";

const MessageNotificationContext = createContext(null);

export const useMessageNotification = () =>
  useContext(MessageNotificationContext);

interface Props {
  children: ReactNode;
}

export const MessageNotificationProvider = ({ children }: Props) => {
  const { socket } = useSocket();
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const blinkIntervalRef = useRef<number>(null);

  const goToChat = useCallback(
    (roomId: string | null) => {
      router.push(`/chat/${roomId}`);
    },
    [router]
  );

  useEffect(() => {
    audioRef.current = new Audio("/beep.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const originalTitle = document.title;

    const blinkTitle = (newTitle: string, times = 7, interval = 500) => {
      if (!document.hidden) return;

      let count = 0;

      blinkIntervalRef.current = window.setInterval(() => {
        document.title =
          document.title === originalTitle ? newTitle : originalTitle;
        count++;
        if (count >= times * 2) {
          if (blinkIntervalRef.current) {
            clearInterval(blinkIntervalRef.current);
          }

          document.title = originalTitle;
        }
      }, interval);
    };

    const playBeep = () => {
      if (!audioRef.current || !document.hidden) return;
      const clone = audioRef.current.cloneNode() as HTMLAudioElement;
      clone.play().catch(console.error);
    };

    const handleChatMessage: ServerToClientEvents["chat-message"] = ({
      roomId,
    }) => {
      if (!pathname.startsWith("/chat")) {
        const toastId = toast.info("Ново съобщение в чата!", {
          action: (
            <Button
              type="button"
              onClick={() => {
                goToChat(roomId);
                toast.dismiss(toastId);
              }}
            >
              Виж
            </Button>
          ),
        });
      }
      blinkTitle("💬 Ново съобщение!");
      playBeep();
    };

    const handleFocus = () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }

      document.title = originalTitle;
    };

    socket.on("chat-message", handleChatMessage);
    window.addEventListener("focus", handleFocus);

    return () => {
      socket.off("chat-message", handleChatMessage);
      window.removeEventListener("focus", handleFocus);
      document.title = originalTitle;
    };
  }, [socket, pathname, router, goToChat]);

  return (
    <MessageNotificationContext.Provider value={null}>
      {children}
    </MessageNotificationContext.Provider>
  );
};
