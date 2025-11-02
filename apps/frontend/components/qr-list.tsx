"use client";
import { Guest } from "@/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { useQRCode } from "next-qrcode";

interface Props {
  guests: Guest[];
}

export function QrList({ guests }: Props) {
  const { Canvas } = useQRCode();
  const baseUrl = new URL(
    "/rsvp",
    process.env.NODE_ENV === "production"
      ? "https://svatba2026.com"
      : "https://preview.svatba2026.com"
  );

  return (
    <>
      <div className="grid grid-cols-10 gap-2 justify-items-center print:grid-cols-10">
        {guests.map((guest, i) => (
          <Card
            key={i}
            className="flex flex-col items-center justify-center p-1 print:p-0 bg-white shadow-none print:shadow-none border border-gray-200 print:border-none"
          >
            <p className="text-center">{guest.name}</p>
            <Canvas
              text={`${baseUrl.toString()}/${guest.id}`}
              options={{
                margin: 2,
                scale: 4,
                width: 120,
                color: {
                  dark: "#000000",
                  light: "#ffffff",
                },
              }}
            />
            <p>text={`${baseUrl.toString()}/${guest.id}`}</p>
          </Card>
        ))}

        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            body {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            canvas {
              page-break-inside: avoid;
            }
          }
        `}</style>
      </div>
      <div className="text-center print:hidden">
        <Button type="button" onClick={() => window.print()} className="mt-10">
          Отпечатай страницата
        </Button>
      </div>
    </>
  );
}
