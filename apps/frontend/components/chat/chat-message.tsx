import { Guest, Message } from "@/store/chatStore";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { memo } from "react";
import { getInitials } from "../guest-selector/utils";

interface Props {
  sender?: Guest;
  message: Message;
  isCurrentUser?: boolean;
}

export function ChatMessage({ sender, message, isCurrentUser }: Props) {
  return (
    <div
      className={`flex gap-3 items-start ${
        isCurrentUser ? "flex-row-reverse text-right" : ""
      }`}
      id={`chat-message-${message.id}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="size-8 border">
            <AvatarFallback className="bg-accent/20 text-xs select-none">
              {getInitials(sender?.name ?? "")}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {sender?.name} ({sender?.table?.label})
          </p>
        </TooltipContent>
      </Tooltip>
      <div
        className={`flex-1 ${isCurrentUser ? "flex flex-col items-end" : ""}`}
      >
        <div
          className={`flex items-center gap-2 mb-1 ${
            isCurrentUser ? "flex-row-reverse" : ""
          }`}
        >
          <p className="text-sm font-medium text-foreground">{sender?.name}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{new Date(message.createdAt).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div
          className={`inline-block p-3 rounded-lg ${
            isCurrentUser
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export function SystemMessage({ message }: { message: string }) {
  return (
    <p className="text-center text-muted-foreground text-shadow-2xs italic text-sm py-4">
      {message}
    </p>
  );
}

export default memo(ChatMessage);
