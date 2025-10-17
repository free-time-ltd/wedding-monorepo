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
import { Guest } from "@/store/chatStore";
import { GuestList } from "../guest-list";

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

  const handleGuestSelect = (guests: string[]) =>
    setSelectedParticipants(guests);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Създай Нова Чат Стая
          </DialogTitle>
          <DialogDescription>
            Създайте нова стая за чат с останалите гости. Поканете конкретна
            група или просто комуникирайте със всички!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Име на стая</Label>
            <Input
              id="room-name"
              placeholder="пример Чат на стая №5"
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
              Направи стаята частна (само с покана)
            </Label>
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <GuestList
                guests={guests}
                striped
                selectable
                searchable
                onSelect={handleGuestSelect}
                defaultSelected={selectedParticipants}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Откажи
          </Button>
          <Button onClick={handleSubmit} disabled={!roomName.trim()}>
            Създай стая
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
