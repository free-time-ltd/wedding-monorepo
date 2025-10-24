import { use } from "react";
import { fetchUserUploads } from "@/lib/data";
import { GuestGallery } from "@/components/live-gallery/guest-gallery";

export default function GalleryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: any[] = [];
  // const images = use(fetchUserUploads() ?? []) as unknown as any[];

  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex items-center justify-center">
        <GuestGallery images={images} />
      </div>
    </div>
  );
}
