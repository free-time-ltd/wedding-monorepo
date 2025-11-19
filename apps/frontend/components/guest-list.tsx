import { Guest } from "@/store/chatStore";
import { getInitials } from "./guest-selector/utils";
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import mapByKey from "@repo/utils/mapByKey";
import toArray from "@repo/utils/toArray";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

interface Props {
  guests: Guest[];
  striped?: boolean;
  selectable?: boolean;
  searchable?: boolean;
  defaultSelected?: string[];
  onSelect?: (guests: string[]) => void;
}

export function GuestList({
  guests,
  onSelect,
  striped,
  selectable,
  searchable,
  defaultSelected = [],
}: Props) {
  const { search } = useFuzzySearch(guests, {
    keys: ["name", "table.label"],
  });
  const [genderFilter, setGenderFilter] = useState<Guest["gender"] | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(
    new Set(defaultSelected)
  );

  const filteredGuests = searchable ? search(searchQuery) : guests;
  const mappedGuests = mapByKey(filteredGuests, "gender");

  const guestList =
    genderFilter !== "all"
      ? toArray(mappedGuests.get(genderFilter))
      : filteredGuests;

  const selectedCounts = new Map(
    mappedGuests.entries().map(([gender, users]) => {
      return [
        gender,
        toArray(users).reduce(
          (aggr, user) => (selectedGuests.has(user.id) ? ++aggr : aggr),
          0
        ),
      ];
    })
  );

  if (selectable) {
    filteredGuests.sort(
      (a, b) =>
        Number(selectedGuests.has(b.id)) - Number(selectedGuests.has(a.id))
    );
  }

  const handleSelect = (userId: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }

      return next;
    });

    onSelect?.([...Array.from(selectedGuests), userId]);
  };

  return (
    <>
      {searchable && (
        <div className="search-bar space-y-2">
          <Label htmlFor="guest-search" className="font-medium">
            Търсене по име:
          </Label>
          <Input
            type="search"
            id="guest-search"
            placeholder="Въеведете име на гост..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      <div className="guest-list py-4 space-y-2">
        <Tabs
          defaultValue="all"
          value={genderFilter}
          onValueChange={(val) => setGenderFilter(val as typeof genderFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">
              Всички {selectedGuests.size > 0 && <>({selectedGuests.size})</>}
            </TabsTrigger>
            <TabsTrigger value="male">
              Мъже{" "}
              {!!selectedCounts.get("male") && (
                <>({selectedCounts.get("male")})</>
              )}
            </TabsTrigger>
            <TabsTrigger value="female">
              Жени{" "}
              {!!selectedCounts.get("female") && (
                <>({selectedCounts.get("female")})</>
              )}
            </TabsTrigger>
            <TabsTrigger value="unknown">
              Без пол{" "}
              {!!selectedCounts.get("unknown") && (
                <>({selectedCounts.get("unknown")})</>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
          <div className="divide-y divide-border">
            {guestList.map((guest, i) => (
              <div
                key={guest.id}
                className={`w-full p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors ${striped && i % 2 === 0 ? "bg-accent/5" : ""} ${selectable ? "cursor-pointer" : ""}`}
                onClick={() => selectable && handleSelect(guest.id)}
              >
                {selectable && (
                  <div className="select-box">
                    <Checkbox
                      checked={selectedGuests.has(guest.id)}
                      onClick={() => handleSelect(guest.id)}
                      value={guest.id}
                    />
                  </div>
                )}
                <div className="avatar">
                  <div className="rounded-full border size-10 bg-accent/20 text-accent font-medium flex items-center justify-center">
                    {getInitials(guest.name)}
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{guest.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {guest.table.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectable && (
        <p className="text-xs text-muted-foreground">
          {selectedGuests.size} гост(и) избрани
        </p>
      )}
    </>
  );
}
