import { use } from "react";
import { fetchGuests } from "@/lib/data";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Table, UserPlus, Users } from "@repo/ui/icons";
import { GuestInfo } from "@/components/guest-info";

export default function GuestsPage() {
  const guests = use(fetchGuests()) ?? [];

  const totalGuests = guests.length;
  const totalWithPlusOnes = guests.filter((g) => g.extras).length;
  const totalTables = new Set(guests.map((g) => g.table)).size;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalGuests}
                </p>
                <p className="text-sm text-muted-foreground">Общо Гости</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <UserPlus className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalWithPlusOnes}
                </p>
                <p className="text-sm text-muted-foreground">
                  Гости с Plus One
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Table className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalTables}
                </p>
                <p className="text-sm text-muted-foreground">Маси</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <GuestInfo guests={guests} />
      </div>
    </div>
  );
}
