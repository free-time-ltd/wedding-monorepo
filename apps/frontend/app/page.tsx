import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Navigation } from "@/components/navigation";
import { WeddingDetails } from "@/components/wedding-details";
import { Countdown } from "@/components/countdown";

export const metadata: Metadata = {
  title: "💍 Сватбата на Кристина и Лъчезар - 27.06.2026",
  description:
    "Присъединете се към незабравимото лятно празненство на Кристина и Лъчезар! Разгледайте сватбената страница, споделете емоции и бъдете част от специалния им ден в Collibri Beach Bar.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <section
        className="py-20"
        id="wedding-date"
        hidden={new Date("2026-06-27T19:00:00").getTime() < Date.now()}
      >
        <Countdown date={new Date("2026-06-27T19:00:00")} />
      </section>
      <WeddingDetails />
    </main>
  );
}
