import { use } from "react";
import { fetchUserUploads } from "@/lib/data";
import { GuestGallery } from "@/components/live-gallery/guest-gallery";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/server-data";
import { UploadForm } from "@/components/live-gallery/upload-form";

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const user = use(fetchUser());
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/live-feed")}`);
  }

  const { images } = use(fetchUserUploads());

  return (
    <div className="container mx-auto space-y-6 pt-5">
      <div className="min-h-screen">
        <div className="flex items-center justify-center">
          <div className="flex-col">
            <UploadForm />
            <p>Uploading image as: {user.name}</p>
            <p>Uploaded images: {images.length}</p>
          </div>
        </div>
        <GuestGallery images={images} />
      </div>
    </div>
  );
}
