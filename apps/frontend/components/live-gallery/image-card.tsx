/* eslint-disable @next/next/no-img-element */
import { Card } from "@repo/ui/components/ui/card";
import { likeUpload, ProcessedImageApiType } from "@/lib/data";
import { MouseEvent, SyntheticEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Heart,
  Loader2,
  Maximize,
  RotateCcw,
  RotateCw,
  Share2,
  X,
  ZoomIn,
} from "@repo/ui/icons";
import { Button } from "@repo/ui/components/ui/button";
import { useGalleryStore } from "@/store/galleryStore";
import { cn } from "@repo/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import Link from "next/link";
import { toast } from "@repo/ui";
import { getTimeAgo } from "@/lib/date";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface Props {
  image: ProcessedImageApiType;
}

export default function ImageCard({ image }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHDLoaded, setIsHDLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Rotation is a preview-only convenience; reset it when closing.
      setRotation(0);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Снимка от сватбата на Криси и Лъчо",
      text: image.message ?? "Виж тази снимка!",
      url: image.images.hd,
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Успешно споделяне 💪");
      } catch (e) {
        console.warn("User cancelled share or it failed", e);
        toast.warning("Споделянето отказано.");
      }
    } else {
      // For desktops
      try {
        await navigator.clipboard.writeText(image.images.hd);
        toast.success("Снимката беше споделена успешно.");
      } catch (e) {
        console.error(e);
        toast.error("Адреса на картинката не беше копиран.");
      }
    }
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    const target = e.currentTarget;
    target.src = "/broken-image.png";
    target.onerror = null;
  };

  return (
    <>
      <Card
        key={image.id}
        className="group relative overflow-hidden cursor-pointer aspect-[4/3] bg-muted"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={image.images.lq || "/placeholder.svg"}
          alt={image.originalFilename ?? image.message ?? image.id}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className="object-cover transition-transform duration-300 group-hover:scale-105 absolute inset-0 w-full h-full object-center"
        />

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent space-y-0.5">
          <p className="text-white/80 text-xs">От {image.user.name}</p>
          <p className="text-white/60 text-xs mt-1">
            {getTimeAgo(new Date(image.createdAt))}
          </p>
          <p className="text-white text-sm font-medium truncate pr-14">
            {image.message}
          </p>
        </div>

        <LikeButton image={image} className="absolute bottom-3 right-3 z-10" />
      </Card>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-screen md:max-w-7xl w-full p-0 gap-0 bg-black/95 border-0 [&>button[data-slot=dialog-close]]:hidden">
          <DialogTitle className="sr-only">
            <p>Full screen image</p>
          </DialogTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 text-muted cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" strokeWidth={5} />
                <span className="sr-only">Close</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Затвори</TooltipContent>
          </Tooltip>
          <div className="flex items-center justify-center p-4 overflow-hidden">
            <img
              src={image.images.hd}
              alt={image.key}
              width={Number(image.width)}
              height={Number(image.height)}
              onLoad={() => setIsHDLoaded(true)}
              onError={() => setIsHDLoaded(true)}
              style={{ transform: `rotate(${rotation}deg)` }}
              className="max-h-[85vh] max-w-full object-contain transition-transform duration-300"
            />
            {!isHDLoaded && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex justify-between items-start text-muted px-4 pb-2 -mt-2 gap-2">
            <div className="message-container">
              <p className="text-white/80 text-xs">От {image.user.name}</p>
              <p className="text-sm font-medium">{image.message}</p>
            </div>
            <div className="ml-0 shrink-0 flex items-center">
              <LikeButton image={image} variant="preview" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setRotation((r) => r - 90)}
                  >
                    <RotateCcw />
                    <span className="sr-only">Завърти наляво</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Завърти наляво</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setRotation((r) => r + 90)}
                  >
                    <RotateCw />
                    <span className="sr-only">Завърти надясно</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Завърти надясно</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon-sm" variant="ghost" asChild>
                    <Link href={image.images.hd} target="_blank">
                      <Maximize />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Виж на цял екран</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon-sm" variant="ghost" onClick={handleShare}>
                    <Share2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Сподели</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LikeButton({
  image,
  className,
  variant = "card",
}: {
  image: ProcessedImageApiType;
  className?: string;
  variant?: "card" | "preview";
}) {
  const setLike = useGalleryStore((state) => state.setLike);
  const [pending, setPending] = useState(false);

  const handleLike = async (e: MouseEvent<HTMLButtonElement>) => {
    // Keep clicks from bubbling up to the card (which opens the dialog).
    e.stopPropagation();
    e.preventDefault();
    if (pending) return;

    const prevLiked = image.likedByMe;
    const prevCount = image.likesCount;

    setPending(true);
    // Optimistic toggle.
    setLike(image.id, !prevLiked, prevCount + (prevLiked ? -1 : 1));

    const res = await likeUpload(image.id);
    if (res) {
      setLike(image.id, res.liked, res.likesCount);
    } else {
      // Revert on failure.
      setLike(image.id, prevLiked, prevCount);
      toast.error("Нещо се обърка. Опитай пак.");
    }
    setPending(false);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={pending}
      aria-pressed={image.likedByMe}
      aria-label={image.likedByMe ? "Премахни харесване" : "Харесай"}
      className={cn(
        "inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60",
        variant === "card" &&
          "rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-sm px-2.5 py-1 text-white",
        variant === "preview" &&
          "rounded-md px-2 py-1.5 text-muted hover:text-white",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          image.likedByMe && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-xs font-medium tabular-nums">
        {image.likesCount}
      </span>
    </button>
  );
}

export function ImageCardSkeleton() {
  return (
    <Card className="relative overflow-hidden aspect-[4/3] bg-muted">
      <Skeleton className="absolute inset-0" />

      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent space-y-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  );
}
