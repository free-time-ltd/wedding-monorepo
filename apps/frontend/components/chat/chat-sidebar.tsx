import { Card } from "@repo/ui/components/ui/card";
import { NetworkIndicator } from "../network-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "@repo/ui/icons";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { getInitials } from "../guest-selector/utils";
import { RoomButton } from "./room-button";
import { CreateRoomDialog } from "./create-room-dialog";
import { useState } from "react";
import { UserApiType } from "@repo/db/utils";
import { Chatroom, Guest } from "@/store/chatStore";

interface Props {
  user: UserApiType;
  guests: Guest[];
  roomList: Chatroom[];
  unreadMessages: Record<string, number>;
  selectedRoom?: Chatroom | null;
  onRoomChange?: (room: string | null) => void;
  onRoomCreate?: (
    name: string,
    invitedUserIds: string[],
    isPrivate: boolean
  ) => void;
  hidden?: boolean;
}

export function ChatSidebar({
  user,
  guests,
  selectedRoom,
  roomList,
  unreadMessages,
  onRoomChange,
  onRoomCreate,
  hidden,
}: Props) {
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const handleCreateRoom = (
    name: string,
    invitedUserIds: string[],
    isPrivate: boolean
  ) => {
    onRoomCreate?.(name, invitedUserIds, isPrivate);
    setShowCreateRoom(false);
  };

  return (
    <>
      <Card
        className="md:col-span-1 flex flex-col h-full min-h-0 py-2 md:py-6 gap-0 border border-border/50 rounded-lg shadow-none"
        hidden={hidden}
      >
        <div className="px-4 py-0 pb-4 md:py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-foreground flex gap-2 items-center">
              Сватбен Чат
              <NetworkIndicator />
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => setShowCreateRoom(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Създай нова чат стая!</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
            <Avatar>
              <AvatarFallback className="bg-accent/20">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.table.label}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {roomList.map((room) => (
            <RoomButton
              room={room}
              onClick={() => onRoomChange?.(room.id)}
              unreadMessages={unreadMessages[room.id]}
              selected={selectedRoom?.id === room.id}
              key={room.id}
            />
          ))}
        </div>
      </Card>
      <CreateRoomDialog
        open={showCreateRoom}
        guests={guests}
        onOpenChange={setShowCreateRoom}
        onCreateRoom={handleCreateRoom}
        currentGuestId={user.id}
      />
    </>
  );
}
