import type { Metadata } from "next";
import { SelectorPage } from "@/components/guest-selector/selector-page";
import { fetchGuests } from "@/lib/data";
import { Heart } from "@repo/ui/icons";

export const metadata: Metadata = {
  title: "🎟️ Избери своето име – Сватбата на Кристина и Лъчезар",
  description:
    "Открий себе си в списъка с гости и влез в сватбеното изживяване на Кристина и Лъчезар. Малка стъпка към голямото „Да!“ 💫",
};

export default async function GuestSelect() {
  const users = await fetchGuests();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-accent/10">
              <Heart className="h-8 w-8 text-destructive fill-destructive" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-balance text-foreground">
            Добре дошли на нашата сватба!
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Моле изберете вашето име от списъка с гости за да достъпите чата
          </p>
        </div>
        <SelectorPage guests={users} />
      </div>
    </div>
  );
}
