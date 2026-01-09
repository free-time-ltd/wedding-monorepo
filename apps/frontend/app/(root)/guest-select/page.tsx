import type { Metadata } from "next";
import { SelectorPage } from "@/components/guest-selector/selector-page";
import { fetchGuests } from "@/lib/data";
import { Heart } from "@repo/ui/icons";
import { Suspense, use } from "react";

export const metadata: Metadata = {
  title: "🎟️ Избери своето име – Сватбата на Кристина и Лъчезар",
  description:
    "Открий себе си в списъка с гости и влез в сватбеното изживяване на Кристина и Лъчезар. Малка стъпка към голямото „Да!“ 💫",
};

export default function GuestSelect() {
  const guests = use(fetchGuests()) ?? [];

  return (
    <div className="min-h-screen pt-8">
      <div className="container px-4 sm:px-0 mx-auto max-w-3xl">
        <div className="text-center mb-4 space-y-2">
          <div className="flex justify-center mb-4">
            <div
              className={`divider-ornament text-accent transition-all duration-700 delay-200`}
            >
              <div className="p-3 rounded-full bg-accent/10">
                <Heart className="h-8 w-8 text-destructive fill-destructive" />
              </div>
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-balance text-foreground">
            Добре дошли на нашата сватба!
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Моля изберете вашето име от списъка с гости за да достъпите чата
          </p>
          <p className="text-sm text-muted-foreground text-pretty">
            (Молим Ви да изберете правилното име, за да няма грешки в чата и
            галерията)
          </p>
        </div>
        <Suspense>
          <SelectorPage guests={guests} />
        </Suspense>
      </div>
    </div>
  );
}
