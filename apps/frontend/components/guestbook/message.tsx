"use client";

import { GuestbookEntry } from "@/lib/data";
import { getTimeAgo } from "@/lib/date";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Heart } from "@repo/ui/icons";
import { useEffect, useRef } from "react";

interface Props {
  message: GuestbookEntry;
  onClick?: (id: number) => void;
  liked: boolean;
}

export function GuestbookMessage({ message, liked, onClick }: Props) {
  const isInitialRender = useRef(true);

  const handleLikeClick = () => {
    onClick?.(message.id);
  };

  useEffect(() => {
    isInitialRender.current = false;
  }, []);

  return (
    <Card className="break-inside-avoid p-6 bg-card border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif font-semibold text-foreground">
            {message.user.name}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-accent-foreground transition-colors relative"
          onClick={handleLikeClick}
        >
          <Heart
            key={message.id}
            className={`h-4 w-4 ${
              liked ? "fill-accent text-accent-foreground" : ""
            } ${!isInitialRender.current ? "animate-[scale-pop_0.3s_ease-out]" : ""}`}
          />
          <span className="text-xs">{message.likesCount}</span>

          {liked && !isInitialRender.current && (
            <div
              key={`hearts-${message.id}`}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute left-1/2 top-1/2 h-3 w-3 fill-accent text-accent-foreground -translate-x-1/2 -translate-y-1/2 animate-[float-up_1s_ease-out_forwards] opacity-0"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    left: `${50 + (i - 1) * 15}%`,
                  }}
                />
              ))}
            </div>
          )}
        </Button>
      </div>

      {!!message.title && <h4 className="font-serif">{message.title}</h4>}

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {message.message}
      </p>

      <p className="text-xs text-muted-foreground">
        {getTimeAgo(message.createdAt)}
      </p>
    </Card>
  );
}
