import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Navigation } from "@/components/navigation";
import { WeddingDetails } from "@/components/wedding-details";

export const metadata: Metadata = {
  title: "💍 Сватбата на Кристина и Лъчезар - 07.07.2026",
  description:
    "Присъединете се към незабравимото лятно празненство на Кристина и Лъчезар! Разгледайте сватбената страница, споделете емоции и бъдете част от специалния им ден в Collibri Beach Bar.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <WeddingDetails />
    </main>
  );
}
