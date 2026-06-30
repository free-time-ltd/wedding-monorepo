import { WeddingGallerySignup } from "@/components/gallery-signup";
import { fetchGalleryAlbums, fetchOfficialGallery } from "@/lib/data";
import { OfficialGallery } from "@/components/official-gallery/official-gallery";
import { mockOfficialPhotos, mockAlbums } from "@/lib/mock-gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Галерия – Снимки от сватбата на Кристина и Лъчезар",
  description: "Официалните снимки от нашия специален ден",
};

// LOCAL PREVIEW ONLY — set to false (or remove the mock import + this block)
// before shipping to prod, so the page reads real photos from the API.
const USE_MOCK = false;

export default async function GalleryPage() {
  const [fetchedImages, fetchedAlbums] = await Promise.all([
    fetchOfficialGallery(),
    fetchGalleryAlbums(),
  ]);

  const images = USE_MOCK ? mockOfficialPhotos : fetchedImages;
  const albums = USE_MOCK ? mockAlbums : fetchedAlbums;

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-8xl text-center font-serif font-bold">
            Очаквайте скоро
          </h1>
          <div className="mt-15">
            <WeddingGallerySignup />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 pt-5 px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3 text-balance">
          Нашата галерия
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
          Официалните снимки от нашия специален ден. Разгледай по албуми и
          изтегли любимите си в пълно качество.
        </p>
      </div>

      <OfficialGallery photos={images} albums={albums} />
    </div>
  );
}
