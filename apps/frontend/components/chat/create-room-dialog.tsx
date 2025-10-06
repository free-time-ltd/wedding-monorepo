"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Guest } from "@/store/chatStore";
import { getInitials } from "../guest-selector/utils";

interface CreateRoomDialogProps {
  open: boolean;
  guests: Guest[];
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (
    name: string,
    participantIds: string[],
    isPrivate: boolean
  ) => void;
  currentGuestId: string;
}

export function CreateRoomDialog({
  open,
  guests,
  onOpenChange,
  onCreateRoom,
  currentGuestId,
}: CreateRoomDialogProps) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([
    currentGuestId,
  ]);

  const handleSubmit = () => {
    if (!roomName.trim()) return;
    onCreateRoom(
      roomName,
      isPrivate ? selectedParticipants : guests.map((g) => g.id),
      isPrivate
    );
    setRoomName("");
    setIsPrivate(false);
    setSelectedParticipants([currentGuestId]);
  };

  const toggleParticipant = (guestId: string) => {
    if (guestId === currentGuestId) return; // Cannot remove yourself
    setSelectedParticipants((prev) =>
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Create Chat Room
          </DialogTitle>
          <DialogDescription>
            Create a new room to chat with other guests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="e.g., Table 5 Group"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked === true)}
            />
            <Label
              htmlFor="private"
              className="text-sm font-normal cursor-pointer"
            >
              Make this a private room
            </Label>
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label>Select Participants</Label>
              <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => toggleParticipant(guest.id)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-accent/5 transition-colors border-b border-border last:border-0 ${
                      guest.id === currentGuestId
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedParticipants.includes(guest.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent/20 text-accent text-xs">
                        {getInitials(guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {guest.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {guest.table.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedParticipants.length} participant
                {selectedParticipants.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!roomName.trim()}>
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
