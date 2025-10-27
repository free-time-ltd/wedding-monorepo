import { use } from "react";
import { fetchUserUploads } from "@/lib/data";
import { GuestGallery } from "@/components/live-gallery/guest-gallery";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/server-data";
import { UploadForm } from "@/components/live-gallery/upload-form";
import { Metadata } from "next";
import { Card } from "@repo/ui/components/ui/card";
import { Images, Users } from "@repo/ui/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Моменти на Живо – Сподели радостта с Кристина и Лъчезар",
  description: "Виж всички снимки, споделяни от нашите гости в реално време",
};

export default function GalleryPage() {
  const user = use(fetchUser());
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/live-feed")}`);
  }

  const { images = [] } = use(fetchUserUploads());

  const uniqueUserIds = new Set(images.map((image) => image.user.id));

  return (
    <div className="container mx-auto space-y-6 pt-5 px-4 sm:px-0">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">
          Сподели своите спомени
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
          Каним те да споделиш своите снимки от нашия специален ден. Твоите
          заснети моменти ни помагат отново да преживеем магията и радостта от
          нашия празник заедно.
        </p>
      </div>

      <div className="min-h-screen space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex-col">
            <UploadForm />
          </div>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {uniqueUserIds.size}
              </span>{" "}
              Гости
            </span>
          </Card>
          <Card className="px-4 py-2 flex items-center gap-2">
            <Images className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {images.length}
              </span>{" "}
              Снимки
            </span>
          </Card>
        </div>
        <GuestGallery images={images} />
      </div>
    </div>
  );
}
