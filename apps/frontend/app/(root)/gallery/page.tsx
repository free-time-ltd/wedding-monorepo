import { WeddingGallerySignup } from "@/components/gallery-signup";

export default function LiveFeedPage() {
  return (
    <div className="container mx-auto">
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
