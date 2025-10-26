/* eslint-disable @next/next/no-img-element */
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { getInitials } from "../guest-selector/utils";
import { ProcessedImageApiType } from "@/lib/data";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Maximize, Share2, X } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import Link from "next/link";
import { toast } from "@repo/ui";

interface Props {
  image: ProcessedImageApiType;
}

export default function ImageCard({ image }: Props) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <Card
        className="w-full max-w-xs shadow-none py-0 gap-0 transition-transform hover:scale-105"
        key={image.id}
      >
        <CardHeader className="flex flex-row items-center justify-between py-2.5 -mr-1">
          <Avatar>
            <AvatarFallback className="bg-accent/20 text-accent">
              {getInitials("Lachezar Tsochev")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {image.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {image.user.table.label}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="relative bg-muted border-y cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <img
              src={image.images.thumb}
              loading="lazy"
              alt={image.key}
              className="block w-full"
            />
          </div>
          <div className="py-5 px-6">
            <p className="mt-1 text-sm text-muted-foreground">
              {image.message}
            </p>
          </div>
        </CardContent>
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
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
          <div className="flex justify-end text-muted px-4 pb-2 -mt-2 gap-2">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
