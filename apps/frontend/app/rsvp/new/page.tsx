import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from "@repo/ui/icons";
import Image from "next/image";
import Link from "next/link";

export default function NewRsvpPage() {
  return (
    <>
      <div className="min-h-screen bg-cream-50">
        {/* Header */}
        <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Към началната страница
              </Link>
            </Button>
          </div>
        </header>

        {/* RSVP Form */}
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif text-sage-800 mb-2">
              Поканени сте!
            </h1>
          </div>
        </div>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="/flowers.webp"
            alt="Flowers Background"
            fill
            objectFit="contain"
          />
        </div>
      </div>
    </>
  );
}
