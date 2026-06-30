"use client";

import { motion } from "motion/react";
import type { Album } from "@/lib/data";
import { cn } from "@repo/ui/lib/utils";

interface Props {
  albums: Album[];
  total: number;
  active: string | null;
  onChange: (album: string | null) => void;
}

export function AlbumTabs({ albums, total, active, onChange }: Props) {
  // Don't bother showing tabs when everything is in one (unnamed) bucket.
  if (albums.length <= 1) return null;

  const tabs: { value: string | null; label: string; count: number }[] = [
    { value: null, label: "Всички", count: total },
    ...albums.map((a) => ({
      value: a.album,
      label: a.album,
      count: a.imageCount,
    })),
  ];

  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden snap-x">
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value ?? "__all__"}
              type="button"
              onClick={() => onChange(tab.value)}
              aria-pressed={isActive}
              className={cn(
                "relative shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="album-pill"
                  className="absolute inset-0 rounded-full bg-primary shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative z-10">
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    isActive ? "opacity-80" : "opacity-50",
                  )}
                >
                  {tab.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
