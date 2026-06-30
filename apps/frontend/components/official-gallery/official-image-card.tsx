/* eslint-disable @next/next/no-img-element */
"use client";

import { SyntheticEvent, useState } from "react";
import { Loader2, ZoomIn } from "@repo/ui/icons";
import type { OfficialPhoto } from "@/lib/data";
import { buildOfficialUrls } from "./urls";

interface Props {
  photo: OfficialPhoto;
  onOpen: () => void;
}

export function OfficialImageCard({ photo, onOpen }: Props) {
  const [loaded, setLoaded] = useState(false);
  const { thumb } = buildOfficialUrls(photo);

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    const target = e.currentTarget;
    target.src = "/placeholder.svg";
    target.onerror = null;
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={photo.title}
      className="group relative block w-full aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
    >
      <img
        src={thumb}
        alt={photo.title}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
        <ZoomIn className="h-7 w-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </button>
  );
}
