"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Switch } from "@repo/ui/components/ui/switch";
import { Send } from "@repo/ui/icons";
import { FormEvent, useState } from "react";

interface Props {
  onSubmit?: (params: {
    title?: string;
    message: string;
    isPrivate: boolean;
  }) => void;
  maxLength?: number;
}

export function GuestbookMessageForm({ onSubmit, maxLength = 500 }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit?.({ title, message, isPrivate });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Заглавие</Label>
          <Input
            id="title"
            placeholder="Въведете заглавие (не е задължително)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Вашето съобщение *</Label>
        <Textarea
          id="message"
          placeholder="Споделете вашите пожелания, спомени или съвет за новото семейство"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={maxLength}
          className="bg-background resize-none min-h-36"
        />
        {maxLength > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/{maxLength} символа
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 items-center">
        <Label
          htmlFor="private-switch"
          className="text-xs text-muted-foreground"
        >
          Скрито съобщение (само за младоженците)
        </Label>
        <Switch
          id="private-switch"
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        <Send className="h-4 w-4 mr-2" />
        Изпрати
      </Button>
    </form>
  );
}
