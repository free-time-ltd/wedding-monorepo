import { Chatroom, Guest } from "@/store/chatStore";
import { MessageCircle } from "@repo/ui/icons";
import {
  forwardRef,
  memo,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ChatMessage from "./chat-message";
import { UserApiType } from "@repo/db/utils";

interface Props {
  guests: Guest[];
  user: UserApiType;
  messages: Chatroom["messages"];
  onScroll?: (isAtBottom: boolean) => void;
}

export type ChatAreaHandle = {
  scrollToBottom: (opts?: ScrollToOptions) => void;
  scrollToMessage: (id: number, opts?: ScrollIntoViewOptions) => void;
  isAtBottom: () => boolean;
};

const ChatArea = forwardRef<ChatAreaHandle, Props>(
  ({ messages, guests, user, onScroll }, ref: Ref<ChatAreaHandle>) => {
    const messagesRef = useRef<HTMLDivElement>(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
    const roomMessages = Array.from(messages);

    const isAtBottom = () => {
      const el = messagesRef.current;
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    };

    const scrollToBottom = (opts?: ScrollOptions) => {
      const el = messagesRef.current;
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
          ...(opts || {}),
        });
        setIsScrolledToBottom(true);
        onScroll?.(true);
      }
    };

    useImperativeHandle(ref, () => ({
      scrollToBottom,
      isAtBottom,
      scrollToMessage: (id: number, opts) => {
        const el = document.getElementById(`message-${id}`);
        if (el) {
          el.scrollIntoView({
            behavior: opts?.behavior ?? "smooth",
            block: opts?.block ?? "center",
          });
        }
      },
    }));

    // Handle scroll events to update isScrolledToBottom
    useEffect(() => {
      const handleScroll = () => {
        const isBottom = isAtBottom();
        setIsScrolledToBottom(isAtBottom);
        onScroll?.(isBottom);
      };

      const el = messagesRef.current;
      if (el) {
        el.addEventListener("scroll", handleScroll);
        const isBottom = isAtBottom();
        setIsScrolledToBottom(isBottom);
        onScroll?.(isBottom);
      }

      return () => {
        if (el) {
          el.removeEventListener("scroll", handleScroll);
        }
      };
    }, [onScroll]);

    // Automatic scroll to bottom when new messages are added
    useEffect(() => {
      const el = messagesRef.current;
      if (el && isScrolledToBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }, [messages, isScrolledToBottom]);

    return (
      <div
        className="flex-1 p-4 space-y-4 overflow-y-auto relative"
        ref={messagesRef}
      >
        {roomMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Все още няма съобщения!</p>
            <p className="text-sm text-muted-foreground">
              Бъди пръв и кажи Здравей!
            </p>
          </div>
        ) : (
          roomMessages.map((msg) => {
            const sender = guests.find((guest) => guest.id === msg.userId);

            return (
              <ChatMessage
                sender={sender}
                message={msg}
                isCurrentUser={msg.userId === user.id}
                key={msg.id}
              />
            );
          })
        )}
      </div>
    );
  }
);

ChatArea.displayName = "ChatArea";

export default memo(
  ChatArea,
  (prev, next) => prev.messages.size === next.messages.size
);
