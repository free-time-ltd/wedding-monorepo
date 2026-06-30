"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Album, OfficialPhoto } from "@/lib/data";
import { AlbumTabs } from "./album-tabs";
import { OfficialImageCard } from "./official-image-card";
import { Lightbox } from "./lightbox";
import { photoInAlbum } from "./urls";

interface Props {
  photos: OfficialPhoto[];
  albums: Album[];
}

export function OfficialGallery({ photos, albums }: Props) {
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => photos.filter((p) => photoInAlbum(p, activeAlbum)),
    [photos, activeAlbum],
  );

  const switchAlbum = (album: string | null) => {
    // Closing any open lightbox avoids a stale index against the new list.
    setOpenIndex(null);
    setActiveAlbum(album);
  };

  return (
    <div className="space-y-5">
      <AlbumTabs
        albums={albums}
        total={photos.length}
        active={activeAlbum}
        onChange={switchAlbum}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeAlbum ?? "__all__"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
        >
          {filtered.map((photo, i) => {
            // Only animate the first screenful in; beyond that we skip the
            // entrance animation entirely so large albums don't mount hundreds
            // of simultaneous animations on a phone.
            const animateIn = i < 24;
            return (
              <motion.div
                key={photo.id}
                initial={animateIn ? { opacity: 0, y: 14 } : false}
                animate={
                  animateIn
                    ? {
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: Math.min(i, 10) * 0.03,
                          duration: 0.25,
                        },
                      }
                    : { opacity: 1, y: 0 }
                }
              >
                <OfficialImageCard
                  photo={photo}
                  onOpen={() => setOpenIndex(i)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <Lightbox
        photos={filtered}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
}
