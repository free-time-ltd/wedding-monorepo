"use client";

import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { useState } from "react";
import {
  Plus,
  Users,
  Lock,
  ArrowLeft,
  MessageCircle,
  Send,
} from "@repo/ui/icons";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { getInitials } from "../guest-selector/utils";
import { Input } from "@repo/ui/components/ui/input";
import { type Message, useChatStore } from "@/store/chatStore";
import { ChatProps } from "./chat-page";
import { CreateRoomDialog } from "./create-room-dialog";

export function ChatUI({ user, guests }: ChatProps) {
  const chatrooms = useChatStore((state) => state.chatrooms);
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const setCurrentChatroom = useChatStore((state) => state.setCurrentChatroom);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const currentGuest = { ...user };
  const selectedRoom = currentChatroom ? chatrooms[currentChatroom] : null;

  const filteredRooms = Object.values(chatrooms);

  const roomMessages = [] as Message[];

  const handleCreateRoom = (
    name: string,
    invitedUserIds: string[],
    isPrivate: boolean
  ) => {
    console.log({ name, invitedUserIds, isPrivate });
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto h-[calc(100vh-4rem)] max-w-7xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Rooms Sidebar */}
          <Card className="md:col-span-1 flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl text-foreground">
                  Chat Rooms
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowCreateRoom(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-accent/20 text-accent">
                    {getInitials(currentGuest.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {currentGuest.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentGuest.table.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentChatroom(room.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-accent/5 transition-colors border-b border-border ${
                    selectedRoom?.id === room.id ? "bg-accent/10" : ""
                  }`}
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
                      {room.isPrivate && (
                        <span className="text-xs text-muted-foreground">
                          {room.guests.length}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate">
                      last room message
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col h-full">
            {selectedRoom ? (
              <>
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="md:hidden"
                      onClick={() => setCurrentChatroom(null)}
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
                      <p className="text-sm text-muted-foreground">
                        {selectedRoom.guests.length} participants
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {roomMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground">
                        Be the first to say hello!
                      </p>
                    </div>
                  ) : (
                    roomMessages.map((msg) => {
                      const isCurrentUser = msg.userId === currentGuest.id;
                      const sender = guests.find(
                        (guest) => guest.id === msg.userId
                      );

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-accent/20 text-accent text-xs">
                              {getInitials(sender?.name ?? "")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex-1 ${isCurrentUser ? "text-right" : ""}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {sender?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
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
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-serif text-2xl text-foreground mb-2">
                  Select a chat room
                </h3>
                <p className="text-muted-foreground">
                  Choose a room from the sidebar to start chatting
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
    </div>
  );
}
