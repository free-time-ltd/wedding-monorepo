"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getInitials } from "@/components/guest-selector/utils";
import { Users } from "@repo/ui/icons";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Guest } from "@/store/chatStore";
import { useSocket } from "@/context/SocketContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

interface Props {
  guests: Guest[];
}

const bgAlphabet = [..."АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ"] as const;

export function SelectorPage({ guests }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get("redirectTo");
  const shouldRedirect = !!redirectTo && redirectTo.startsWith("/");
  const { isConnected, reconnect } = useSocket();
  const [scrollIconHidden, setScrollIconHidden] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const alphabetRef = useRef<HTMLDivElement>(null);

  const filteredGuests = useMemo(
    () =>
      guests.filter((guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [guests, searchQuery],
  );

  const userGuest = useMemo(
    () => guests.find((guest) => guest.id === selectedGuest),
    [guests, selectedGuest],
  );

  const sortedGuests = useMemo(() => {
    const collator = new Intl.Collator("bg", { sensitivity: "base" });

    return filteredGuests.toSorted((a, b) => collator.compare(a.name, b.name));
  }, [filteredGuests]);

  const groupedGuests = useMemo(() => {
    const grouped = new Map<string, Guest[]>();

    sortedGuests.forEach((guest) => {
      const letter = guest.name.charAt(0).toLocaleUpperCase("bg");

      if (!grouped.has(letter)) {
        grouped.set(letter, []);
      }

      grouped.get(letter)!.push(guest);
    });

    return grouped;
  }, [sortedGuests]);

  const alphabet = useMemo(() => {
    const existingLetters = Array.from(groupedGuests.keys());

    const bgStatus = bgAlphabet.map((letter) => ({
      char: letter,
      isActive: existingLetters.includes(letter),
    }));

    return [...bgStatus];
  }, [groupedGuests]);

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

      if (isConnected) {
        reconnect();
      }

      router.push(shouldRedirect ? redirectTo : "/chat");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

      setScrollIconHidden(atBottom);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollClick = () => {
    const el = scrollAreaRef.current;
    if (!el) return;

    el.scrollBy({
      top: 120,
      behavior: "smooth",
    });
  };

  const scrollToLetter = (
    letter: (typeof alphabet)[number],
    behavior: ScrollBehavior = "smooth",
  ) => {
    if (!scrollAreaRef.current || !letter.isActive) return;

    const container = scrollAreaRef.current;
    const searchIndex = `letter-${letter.char.charCodeAt(0)}`;
    const element = document.getElementById(searchIndex);

    if (container && element) {
      const targetPosition = element.offsetTop;

      container.scrollTo({
        top: targetPosition,
        behavior,
      });
    }
  };

  const handleAlphabetInteraction = (
    e: React.MouseEvent | React.TouchEvent | React.PointerEvent,
    behavior: ScrollBehavior = "auto",
  ) => {
    let clientX: number;
    let clientY: number;

    if ("touches" in e) {
      const touch = e.touches[0];
      if (!touch) return;

      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const target = document.elementFromPoint(
      clientX,
      clientY,
    ) as HTMLElement | null;

    const letter = target?.getAttribute("data-letter");

    if (letter) {
      const charCode = letter.charCodeAt(0);
      const element = document.getElementById(`letter-${charCode}`);

      if (element) {
        element.scrollIntoView({
          behavior,
          block: "start",
        });
      }
    }
  };

  return (
    <div className="card space-y-6 mb-20 md:mb-0">
      <div className="card-body space-y-4 relative">
        <div className="space-y-6 relative">
          {alphabet.length > 0 && (
            <div
              ref={alphabetRef}
              className="group/alphabet absolute sm:hidden -right-4 top-0 bottom-0 z-20 overflow-y-auto no-scrollbar pt-3 -mb-3 touch-none"
              onTouchMove={(e) => handleAlphabetInteraction(e, "instant")}
            >
              <div className="grid grid-cols-1">
                {alphabet.map((letter) => (
                  <button
                    key={`quick-letterl-${letter.char}`}
                    disabled={!letter.isActive}
                    onClick={() => scrollToLetter(letter)}
                    className="cursor-pointer m-0 py-0 text-xs border border-transparent hover:border-primary hover:no-underline text-primary"
                    title={`Виж имена започващи с буквата "${letter.char}"`}
                    data-letter={letter.char}
                  >
                    {letter.char}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <div className="guest-list relative">
            {filteredGuests.length > 0 && (
              <Label className="font-medium pb-2">
                Изберете вашето име от списъка:
              </Label>
            )}
            <div
              className="rounded-lg max-h-80 overflow-y-auto relative"
              ref={scrollAreaRef}
            >
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
                groupedGuests.size > 0 &&
                Array.from(groupedGuests).map(([letter, guests]) => (
                  <div className="group letter" key={`letter-${letter}`}>
                    <div className="border-b mb-2 mx-1">
                      <p
                        className="font-bold text-lg"
                        id={`letter-${letter.charCodeAt(0)}`}
                      >
                        {letter}
                      </p>
                    </div>
                    <div className="divide-y divide-border grid md:grid-cols-3 gap-4 grid-cols-1">
                      {guests.map((guest) => (
                        <button
                          key={guest.id}
                          onClick={() => handleGuestSelect(guest.id)}
                          className={`w-full p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors border rounded-lg relative ${
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
                            <div className="absolute right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
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
                  </div>
                ))
              )}
            </div>
            {filteredGuests.length > 6 && (
              <div
                className={`absolute -bottom-4 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000`}
                hidden={scrollIconHidden}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center cursor-pointer bg-background"
                      onClick={handleScrollClick}
                    >
                      <div className="w-1.5 h-3 bg-primary/60 rounded-full mt-2 animate-bounce" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Скролни надолу</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 p-4 -mx-4 bg-background md:static">
          <Button
            type="button"
            onClick={selectGuest}
            disabled={!selectedGuest || isLoading}
            className="w-full cursor-pointer"
            size="lg"
          >
            {selectedGuest && (
              <>Продлъжете като &quot;{userGuest?.name}&quot;</>
            )}
            {!selectedGuest && <>Продължете напред</>}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center text-pretty">
          Не откривате името си? Моля свържете се с младоженците за подкрепа.
        </p>
      </div>
    </div>
  );
}
