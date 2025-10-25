"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getInitials } from "@/components/guest-selector/utils";
import { Users } from "@repo/ui/icons";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Guest } from "@/store/chatStore";

interface Props {
  guests: Guest[];
}

export function SelectorPage({ guests }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get("redirectTo");
  const shouldRedirect = !!redirectTo && redirectTo.startsWith("/");

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userGuest = useMemo(
    () => guests.find((guest) => guest.id === selectedGuest),
    [guests, selectedGuest]
  );

  const handleGuestSelect = (user: string) => {
    setSelectedGuest(user);
  };

  const selectGuest = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/set", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ user: selectedGuest }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      router.push(shouldRedirect ? redirectTo : "/chat");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card space-y-6">
      <div className="card-header">
        <h1 className="text-2xl font-bold">Достъп до сайта</h1>
        <p>Моля изберете вашето име от списъка по-долу.</p>
      </div>
      <div className="card-body space-y-4">
        <div className="space-y-6">
          <div className="search-field flex flex-col gap-2">
            <Label htmlFor="guest-search" className="font-medium">
              Търсене по име:
            </Label>
            <Input
              type="search"
              id="guest-search"
              placeholder="Въведете вашето име"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="guest-list">
            <label>Изберете вашето име</label>
            <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
              {filteredGuests.length === 0 ? (
                <div className="p-8">
                  <div className="flex items-center justify-center gap-2">
                    <Users />
                    <p className="text-muted-foreground">
                      Не бяха открити гости, които да отговарят на вашия
                      критерий за търсене.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleGuestSelect(guest.id)}
                      className={`w-full p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors ${
                        selectedGuest === guest.id ? "bg-accent/10" : ""
                      }`}
                      disabled={isLoading}
                    >
                      <div className="avatar">
                        <div className="rounded-full border size-10 bg-accent/20 text-accent font-medium flex items-center justify-center">
                          {getInitials(guest.name)}
                        </div>
                      </div>

                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">
                          {guest.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {guest.table.label}
                          {!!guest.extras && " • Plus One Invited"}
                        </p>
                      </div>
                      {selectedGuest === guest.id && (
                        <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-background"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={selectGuest}
          disabled={!selectedGuest || isLoading}
          className="w-full cursor-pointer"
          size="lg"
        >
          {selectedGuest && <>Продлъжете като &quot;{userGuest?.name}&quot;</>}
          {!selectedGuest && <>Продължете напред</>}
        </Button>
        <p className="text-sm text-muted-foreground text-center text-pretty">
          Не откривате името си? Моля свържете се с младоженците за подкрепа.
        </p>
      </div>
    </div>
  );
}
