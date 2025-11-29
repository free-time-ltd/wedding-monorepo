import { use } from "react";
import { fetchGuests } from "@/lib/data";
import { Table, UserPlus, Users } from "@repo/ui/icons";
import { GuestInfo } from "@/components/guest-info";
import { StaticCard } from "@/components/static-card";

export default function GuestsPage() {
  const guests = use(fetchGuests()) ?? [];

  const totalGuests = guests.length;
  const totalWithPlusOnes = guests.filter((g) => g.extras).length;
  const totalTables = new Set(guests.map((g) => g.table)).size;

  const staticCards = [
    {
      icon: Users,
      label: "Общо гости",
      value: totalGuests,
    },
    {
      icon: UserPlus,
      label: "Гости с Plus One",
      value: totalWithPlusOnes,
    },
    {
      icon: Table,
      label: "Маси",
      value: totalTables,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl text-balance text-foreground">
            Списък Гости
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Вижте с кого ще споделим нашия ден
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {staticCards.map((sCard) => (
            <StaticCard
              key={sCard.label}
              label={sCard.label}
              value={String(sCard.value)}
              icon={sCard.icon}
            />
          ))}
        </div>

        <GuestInfo guests={guests} />
      </div>
    </div>
  );
}
