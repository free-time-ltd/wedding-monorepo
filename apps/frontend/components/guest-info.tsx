"use client";

import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { Guest } from "@/store/chatStore";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Search, Table, UserPlus, Users } from "@repo/ui/icons";
import { useMemo, useState } from "react";
import { getInitials } from "./guest-selector/utils";

interface Props {
  guests: Guest[];
}

export function GuestInfo({ guests }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const { search } = useFuzzySearch(guests, { keys: ["name", "table.label"] });

  const filteredGuests = useMemo(() => {
    return searchQuery.trim().length > 1 ? search(searchQuery) : guests;
  }, [searchQuery, guests, search]);

  const guestsByTable = filteredGuests.reduce(
    (acc, guest) => {
      if (!acc[guest.table.label]) {
        acc[guest.table.label ?? "Чакащи настаняване"] = [];
      }

      (acc[guest.table.label ?? "Чакащи настаняване"] ??= []).push(guest);

      return acc;
    },
    {} as Record<string, Guest[]>
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="mb-8 border border-border/50 rounded-lg shadow-none">
        <CardContent className="p-0 px-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Търсете гости по име..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guest List by Table */}
      <div className="space-y-6">
        {Object.keys(guestsByTable)
          .sort()
          .map((tableName) => (
            <Card
              key={tableName}
              className="border border-border/50 rounded-lg shadow-none"
            >
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Table className="h-5 w-5 text-accent" />
                  </div>
                  {tableName}
                  <Badge variant="secondary" className="ml-auto">
                    {guestsByTable[tableName]?.length ?? 0} гости
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guestsByTable[tableName]?.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center gap-3 p-4 border border-border rounded-lg"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-accent/20 text-accent">
                          {getInitials(guest.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {guest.name}
                        </p>
                        {!!guest.extras && (
                          <div className="flex items-center gap-1 mt-1">
                            <UserPlus className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Plus One
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {filteredGuests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Няма гости по търсените от вас критерии
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
