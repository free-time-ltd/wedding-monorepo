import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

export default function QrCodePage() {
  return (
    <main className="container mx-auto px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/svatba-qr.svg"
        alt="QR Code for the wedding"
        className="block w-full max-h-dvh"
      />
      <div className="text-center absolute bottom-5 left-0 right-0">
        <Button type="button" asChild>
          <Link href="/svatba-qr.svg" download="svatba-qr.svg">
            Свали QR Кода
          </Link>
        </Button>
      </div>
    </main>
  );
}
