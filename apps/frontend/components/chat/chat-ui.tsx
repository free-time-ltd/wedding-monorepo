"use client";

import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Users, Lock, ArrowLeft, MessageCircle } from "@repo/ui/icons";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { getInitials } from "../guest-selector/utils";
import { Guest, useChatStore } from "@/store/chatStore";
import { CreateRoomDialog } from "./create-room-dialog";
import { UserApiType } from "@repo/db/utils";
import { RoomButton } from "./room-button";
import { ParticipantsDialog } from "./participants-dialog";
import { NetworkIndicator } from "../network-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useSocket } from "@/context/SocketContext";
import ChatControls from "./chat-controls";

export interface RoomCreationType {
  name: string;
  invitedUserIds: string[];
  isPrivate: boolean;
}

interface Props {
  user: UserApiType;
  guests: Guest[];
  onMessageSend?: (message: string) => void;
  onRoomChange?: (room: string | null) => void;
  onRoomCreate?: (props: RoomCreationType) => void;
}

export function ChatUI({
  user,
  guests,
  onRoomChange,
  onRoomCreate,
  onMessageSend,
}: Props) {
  const { isConnected } = useSocket();
  const chatrooms = useChatStore((state) => state.chatrooms);
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const currentGuest = { ...user };
  const selectedRoom = currentChatroom ? chatrooms[currentChatroom] : null;

  const filteredRooms = Object.values(chatrooms);

  const roomMessages = useMemo(
    () => Array.from(selectedRoom?.messages ?? []),
    [selectedRoom]
  );

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

  // Automatic scroll to bottom
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [roomMessages]);

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto h-[calc(100vh-4rem)] max-w-7xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Rooms Sidebar */}
          <Card className="md:col-span-1 flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
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
                    {getInitials(currentGuest.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {currentGuest.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentGuest?.table?.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredRooms.map((room) => (
                <RoomButton
                  room={room}
                  onClick={() => handleRoomChange(room.id)}
                  selected={selectedRoom?.id === room.id}
                  key={room.id}
                />
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col h-full min-h-0">
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

                <div
                  className="flex-1 p-4 space-y-4 overflow-y-auto"
                  ref={messagesRef}
                >
                  {roomMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        Все още няма съобщения!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Бъди пръв и кажи Здравей!
                      </p>
                    </div>
                  ) : (
                    roomMessages.map((msg) => {
                      const isCurrentUser = msg.userId === currentGuest.id;
                      const sender = guests.find(
                        (guest) => guest.id === msg.userId
                      );

                      return (
                        <div key={msg.id} className={`flex gap-3`}>
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
                          <div className={`flex-1`}>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {sender?.name}
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      }
                                    )}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {new Date(msg.createdAt).toLocaleString({
                                      language: "bg_BG",
                                    })}
                                  </p>
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
                              <p className="text-sm leading-relaxed">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

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
        currentGuestId={currentGuest.id}
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
