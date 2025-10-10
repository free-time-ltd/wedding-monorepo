"use client";

import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { useRef, useState } from "react";
import {
  Users,
  Lock,
  ArrowLeft,
  MessageCircle,
  ChevronDown,
} from "@repo/ui/icons";
import { Guest, useChatStore } from "@/store/chatStore";
import { CreateRoomDialog } from "./create-room-dialog";
import { UserApiType } from "@repo/db/utils";
import { ParticipantsDialog } from "./participants-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useSocket } from "@/context/SocketContext";
import ChatControls from "./chat-controls";
import ChatArea, { ChatAreaHandle } from "./chat-area";
import { ChatSidebar } from "./chat-sidebar";

export interface RoomCreationType {
  name: string;
  invitedUserIds: string[];
  isPrivate: boolean;
}

interface Props {
  user: UserApiType;
  guests: Guest[];
  currentChatroom: string | null;
  onMessageSend?: (message: string) => void;
  onRoomChange?: (room: string | null) => void;
  onRoomCreate?: (props: RoomCreationType) => void;
}

export function ChatUI({
  user,
  guests,
  currentChatroom,
  onRoomChange,
  onRoomCreate,
  onMessageSend,
}: Props) {
  const { isConnected } = useSocket();
  const chatrooms = useChatStore((state) => state.chatrooms);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isChatAtBottom, setIsChatAtBottom] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<ChatAreaHandle>(null);

  const selectedRoom = currentChatroom ? chatrooms[currentChatroom] : null;

  const filteredRooms = Object.values(chatrooms);

  const handleCreateRoom = (
    name: string,
    invitedUserIds: string[],
    isPrivate: boolean
  ) => {
    onRoomCreate?.({ name, invitedUserIds, isPrivate });
    setShowCreateRoom(false);
  };

  const handleRoomChange = (room: string | null) => {
    onRoomChange?.(room);
    if (room !== null && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChatSubmit = (message: string) => {
    onMessageSend?.(message);
  };

  const handleChatScroll = (isAtBottom: boolean) => {
    setIsChatAtBottom(isAtBottom);
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto h-[calc(100vh-4rem)] max-w-7xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Rooms Sidebar */}
          <ChatSidebar
            guests={guests}
            roomList={filteredRooms}
            user={user}
            selectedRoom={selectedRoom}
            onRoomChange={handleRoomChange}
            onRoomCreate={handleCreateRoom}
          />

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col h-full min-h-0 relative">
            {selectedRoom ? (
              <>
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="md:hidden"
                      onClick={() => onRoomChange?.(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="p-2 rounded-lg bg-accent/10">
                      {selectedRoom.isPrivate ? (
                        <Lock className="h-5 w-5 text-accent" />
                      ) : (
                        <Users className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-foreground">
                        {selectedRoom.name}
                      </h3>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:underline cursor-pointer"
                        onClick={() => setShowParticipants((prev) => !prev)}
                      >
                        {selectedRoom.guests.length} гости
                      </button>
                    </div>
                  </div>
                </div>

                <ChatArea
                  messages={selectedRoom.messages}
                  guests={guests}
                  user={user}
                  onScroll={handleChatScroll}
                  ref={messagesRef}
                />
                {!isChatAtBottom && (
                  <div className="absolute left-0 right-0 bottom-28 flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => messagesRef.current?.scrollToBottom()}
                        >
                          <ChevronDown />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Виж последните съобщения</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                <div className="p-4 border-t border-border">
                  <ChatControls
                    disabled={!isConnected}
                    onSubmit={handleChatSubmit}
                    ref={inputRef}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-serif text-2xl text-foreground mb-2">
                  Изберете чат стая
                </h3>
                <p className="text-muted-foreground">
                  Изберете чат стая от менюто вляво за да започнете чат
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <CreateRoomDialog
        open={showCreateRoom}
        guests={guests}
        onOpenChange={setShowCreateRoom}
        onCreateRoom={handleCreateRoom}
        currentGuestId={user.id}
      />

      <ParticipantsDialog
        open={showParticipants}
        name={selectedRoom?.name ?? ""}
        onOpenChange={setShowParticipants}
        guests={selectedRoom?.guests ?? []}
      />
    </div>
  );
}
