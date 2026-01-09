import type { Metadata } from "next";
import { MonteCarlo, RobotoSerif } from "@/lib/fonts";
import "./globals.css";
import Providers from "@/context/Providers";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "💍 Сватбата на Кристина и Лъчезар - 27.06.2026",
  description:
    "Присъединете се към незабравимото лятно празненство на Кристина и Лъчезар! Разгледайте сватбената страница, споделете емоции и бъдете част от специалния им ден в Collibri Beach Bar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body
        className={`${MonteCarlo.variable} ${RobotoSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
