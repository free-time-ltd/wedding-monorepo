import { use } from "react";
import { fetchUserUploads } from "@/lib/data";
import { GuestGallery } from "@/components/live-gallery/guest-gallery";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const user = use(fetchUser());
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/live-feed")}`);
  }

  const { images } = use(fetchUserUploads());

  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex items-center justify-center">
        <GuestGallery user={user} images={images} />
      </div>
    </div>
  );
}
