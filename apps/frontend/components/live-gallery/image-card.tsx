/* eslint-disable @next/next/no-img-element */
import { Card } from "@repo/ui/components/ui/card";
import { ProcessedImageApiType } from "@/lib/data";
import { SyntheticEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Loader2, Maximize, Share2, X, ZoomIn } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/ui/button";
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
          <p className="text-white text-sm font-medium truncate">
            {image.message}
          </p>
        </div>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen md:max-w-7xl w-full p-0 gap-0 bg-black/95 border-0 [&>button[data-slot=dialog-close]]:hidden">
          <DialogTitle className="sr-only">
            <p>Full screen image</p>
          </DialogTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="absolute -right-4 -top-4"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Затвори</TooltipContent>
          </Tooltip>
          <div className="flex items-center justify-center p-4">
            <img
              src={image.images.hd}
              alt={image.key}
              width={Number(image.width)}
              height={Number(image.height)}
              onLoad={() => setIsHDLoaded(true)}
              onError={() => setIsHDLoaded(true)}
              className="max-h-[85vh] max-w-full object-contain"
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
            <div className="ml-0 shrink-0">
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
