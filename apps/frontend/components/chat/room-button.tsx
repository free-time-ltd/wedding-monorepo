import { Chatroom } from "@/store/chatStore";
import { Badge } from "@repo/ui/components/ui/badge";
import { Users, Lock } from "@repo/ui/icons";

interface Props {
  room: Chatroom;
  selected?: boolean;
  disabled?: boolean;
  unreadMessages?: number;
  onClick?: () => void;
}

export function RoomButton({
  room,
  onClick,
  selected,
  unreadMessages,
  disabled,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-accent/5 transition-colors border-b border-border ${
        selected ? "bg-accent/10" : ""
      }`}
      disabled={disabled}
    >
      <div className="p-2 rounded-lg bg-accent/10 mt-1">
        {room.isPrivate ? (
          <Lock className="h-4 w-4 text-accent" />
        ) : (
          <Users className="h-4 w-4 text-accent" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-medium text-sm text-foreground truncate">
            {room.name}
          </p>
          {!!unreadMessages && (
            <Badge variant="destructive" className="rounded-full">
              {unreadMessages}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground truncate">
          {room.lastMessage?.content}
        </p>
      </div>
    </button>
  );
}
