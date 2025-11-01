import { QrList } from "@/components/qr-list";
import { fetchGuests } from "@/lib/data";
import { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Списък с гости, QR формат",
};

export default function RsvpListPage() {
  const guests = use(fetchGuests());

  return (
    <div className="print:bg-white print:text-black p-4 bg-gray-100 min-h-screen">
      <h1 className="text-center text-xl font-semibold font-serif mb-4 print:hidden">
        QR Codes (Printable A4)
      </h1>

      <QrList guests={guests ?? []} />
    </div>
  );
}
