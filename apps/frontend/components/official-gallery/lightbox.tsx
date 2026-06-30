"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Share2,
  X,
} from "@repo/ui/icons";
import { toast } from "@repo/ui";
import type { OfficialPhoto } from "@/lib/data";
import { buildOfficialUrls } from "./urls";

interface Props {
  photos: OfficialPhoto[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onIndexChange }: Props) {
  const open = index !== null;
  const photo = open ? photos[index] : undefined;
  const [hdLoaded, setHdLoaded] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      const next = (index + dir + photos.length) % photos.length;
      onIndexChange(next);
    },
    [index, photos.length, onIndexChange],
  );

  // Reset the HD spinner whenever we move to a different photo.
  useEffect(() => {
    setHdLoaded(false);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const handleShare = async () => {
    if (!photo) return;
    const urls = buildOfficialUrls(photo);
    const shareData = {
      title: "Снимка от сватбата на Криси и Лъчо",
      text: photo.title ?? "Виж тази снимка!",
      url: urls.hd,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success("Успешно споделяне 💪");
      } else {
        await navigator.clipboard.writeText(urls.hd);
        toast.success("Адресът на снимката беше копиран.");
      }
    } catch (e) {
      console.warn("Share cancelled or failed", e);
    }
  };

  if (!photo) return null;

  const urls = buildOfficialUrls(photo);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-screen sm:max-w-screen w-screen h-[100dvh] sm:h-[100dvh] p-0 gap-0 bg-black/97 border-0 rounded-none [&>button[data-slot=dialog-close]]:hidden">
        <DialogTitle className="sr-only">{photo.title}</DialogTitle>

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent">
          <span className="text-white/70 text-sm tabular-nums pl-1">
            {(index ?? 0) + 1} / {photos.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Сподели</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              asChild
            >
              <a href={urls.download} download>
                <Download className="h-5 w-5" />
                <span className="sr-only">Изтегли</span>
              </a>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Затвори</span>
            </Button>
          </div>
        </div>

        {/* Image stage */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {!hdLoaded && (
            <Loader2 className="absolute h-8 w-8 animate-spin text-white/60" />
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={photo.id}
              src={urls.hd}
              alt={photo.title}
              draggable={false}
              onLoad={() => setHdLoaded(true)}
              onError={() => setHdLoaded(true)}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              drag={photos.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(1);
                else if (info.offset.x > 80) go(-1);
              }}
              className="max-h-[100dvh] max-w-screen object-contain touch-pan-y select-none px-2 py-14"
            />
          </AnimatePresence>
        </div>

        {/* Desktop prev/next */}
        {photos.length > 1 && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => go(-1)}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/10 h-12 w-12"
            >
              <ChevronLeft className="h-7 w-7" />
              <span className="sr-only">Предишна</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => go(1)}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/10 h-12 w-12"
            >
              <ChevronRight className="h-7 w-7" />
              <span className="sr-only">Следваща</span>
            </Button>
          </>
        )}

        {/* Caption — title is intentionally not shown (clean lightbox);
            only an optional description appears if one is ever set. */}
        {photo.description && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent text-center">
            <p className="text-white/80 text-xs">{photo.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
