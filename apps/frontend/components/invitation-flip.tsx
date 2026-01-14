"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RsvpPage } from "./rsvp/rsvp-page";

export function InvitationFlip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-screen h-dvh flex justify-center items-center perspective-distant bg-cream-dark/30">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.img
            key="invitation"
            src="/invitation.webp"
            alt="Wedding Invitation"
            className="max-h-full max-w-full w-auto h-auto object-contain cursor-pointer"
            onClick={() => setOpen(true)}
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ backfaceVisibility: "hidden" }}
          />
        ) : (
          <motion.div
            key="rsvp"
            className="h-full w-full overflow-y-auto"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ backfaceVisibility: "hidden" }}
          >
            <RsvpPage
              guestId="1231231"
              guest={{
                id: "123123",
                name: "Bai hui",
                family: {
                  id: 23,
                  members: [],
                  name: "hoi",
                },
                table: {
                  id: 23,
                  label: "kek",
                  name: "kekw",
                },
                gender: "male",
                tableId: 0,
              }}
              invitation={null}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
