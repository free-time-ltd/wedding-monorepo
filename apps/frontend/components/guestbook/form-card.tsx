"use client";

import { CheckCircle2 } from "@repo/ui/icons";
import { useState } from "react";
import { GuestbookMessageForm } from "./message-form";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";

export function GuestbookSubmitForm() {
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async ({
    title,
    message,
    isPrivate,
  }: {
    title?: string;
    message: string;
    isPrivate: boolean;
  }) => {
    const res = await fetch(
      new URL(`/api/guestbook`, process.env.NEXT_PUBLIC_API_BASE_URL),
      {
        credentials: "include",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, message, private: isPrivate }),
      }
    );

    const json = await res.json();

    if (json.success) {
      setSubmitted(true);
      toast.success("Успешно изпратено съобщение!");
    }
  };

  return (
    <div className="flex justify-center">
      <Button type="button" size="lg" onClick={() => setModalOpen(true)}>
        Добави свое съобщение
      </Button>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogTitle className="sr-only">
            Споделете вашите пожелания
          </DialogTitle>
          <div className="p-6 md:p-8">
            <h2 className="font-serif text-2xl text-foreground mb-6">
              Споделете вашите пожелания
            </h2>

            {submitted ? (
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg text-accent">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Благодарим ви за съобщението! То очаква одобрение и скоро ще
                  бъде публикувано.
                </p>
              </div>
            ) : (
              <GuestbookMessageForm onSubmit={handleSubmit} maxLength={640} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
