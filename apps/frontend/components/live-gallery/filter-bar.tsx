"use client";

import { Guest } from "@/store/chatStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { SlidersHorizontal, SquareX, UserRound } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  guests: Guest[];
}

export function FilterBar({ guests = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? undefined;
  const uploader = searchParams.get("uploader") ?? undefined;

  const handleFilterClear = () => {
    router.push("/live-feed");
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/live-feed?${params.toString()}`);
  };

  const handleUploaderChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("uploader", value);
    router.push(`/live-feed?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {(!!sort || !!uploader) && (
        <Button
          variant="link"
          onClick={handleFilterClear}
          className="text-destructive order-last md:order-first w-full flex justify-center md:w-auto cursor-pointer"
        >
          <SquareX className="size-4" />
          Изчисти
        </Button>
      )}
      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[150px] bg-card shadow-sm flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 opacity-70" />
          <SelectValue placeholder="Подредба" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Най-нови</SelectItem>
          <SelectItem value="asc">Най-стари</SelectItem>
          <SelectItem value="az">A → Я</SelectItem>
          <SelectItem value="za">Я → A</SelectItem>
        </SelectContent>
      </Select>

      <Select value={uploader} onValueChange={handleUploaderChange}>
        <SelectTrigger className="w-[170px] bg-card shadow-sm flex items-center gap-2">
          <UserRound className="h-4 w-4 opacity-70" />
          <SelectValue placeholder="Добавено от" />
        </SelectTrigger>
        <SelectContent>
          {guests.map((guest) => (
            <SelectItem value={guest.id} key={guest.id}>
              {guest.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
