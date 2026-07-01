"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { toast } from "@repo/ui";
import { Check, ChevronsUpDown, Loader2, Tag, X } from "@repo/ui/icons";
import type { OfficialPhoto } from "@/lib/data";
import { buildOfficialUrls, NO_ALBUM } from "@/components/official-gallery/urls";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Sentinel value for the "all albums" option in the filter dropdown (Radix
// Select forbids empty-string item values).
const FILTER_ALL = "__all__";
const FILTER_NONE = "__none__";

type AlbumComboboxProps = {
  value: string | null;
  albumNames: string[];
  disabled?: boolean;
  onChange: (album: string | null) => void;
};

// Free-text input that also suggests every existing album name. Typing filters
// the list; picking a suggestion or pressing Enter commits the value. The clear
// action unsets the album (sends null).
function AlbumCombobox({
  value,
  albumNames,
  disabled,
  onChange,
}: AlbumComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const suggestions = useMemo(() => {
    const q = trimmed.toLowerCase();
    return albumNames.filter((name) => name.toLowerCase().includes(q));
  }, [albumNames, trimmed]);

  const exactMatch = albumNames.some(
    (name) => name.toLowerCase() === trimmed.toLowerCase(),
  );

  const commit = (album: string | null) => {
    onChange(album);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <Tag className="size-4 shrink-0 text-muted-foreground" />
            {value ? (
              <span className="truncate">{value}</span>
            ) : (
              <span className="text-muted-foreground">{NO_ALBUM}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <div className="p-2">
          <Input
            autoFocus
            value={query}
            placeholder="Търси или въведи нов албум…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed.length > 0) {
                e.preventDefault();
                commit(trimmed);
              }
            }}
          />
        </div>
        <div className="max-h-64 overflow-y-auto border-t p-1">
          {trimmed.length > 0 && !exactMatch && (
            <button
              type="button"
              onClick={() => commit(trimmed)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none"
            >
              <Tag className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                Задай „<span className="font-medium">{trimmed}</span>“
              </span>
            </button>
          )}
          {suggestions.map((name) => {
            const active = value === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => commit(name)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none ${
                  active ? "bg-accent/60 font-medium" : ""
                }`}
              >
                <Check
                  className={`size-4 shrink-0 ${active ? "opacity-100" : "opacity-0"}`}
                />
                <span className="truncate">{name}</span>
              </button>
            );
          })}
          {suggestions.length === 0 && trimmed.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              Няма албуми все още
            </p>
          )}
          {value !== null && (
            <>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={() => commit(null)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
              >
                <X className="size-4 shrink-0" />
                Премахни от албум
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function OfficialPhotosManager() {
  const [photos, setPhotos] = useState<OfficialPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<OfficialPhoto | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        new URL(`/api/admin/official-photos`, API_BASE),
        { credentials: "include" },
      );
      const json = await res.json();
      if (json.success) setPhotos(json.data);
    } catch (e) {
      console.error(e);
      toast.error("Неуспешно зареждане на снимките");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const albumNames = useMemo(() => {
    const set = new Set<string>();
    for (const p of photos) {
      if (p.album) set.add(p.album);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bg"));
  }, [photos]);

  const visiblePhotos = useMemo(() => {
    if (filter === FILTER_ALL) return photos;
    if (filter === FILTER_NONE) return photos.filter((p) => p.album == null);
    return photos.filter((p) => p.album === filter);
  }, [photos, filter]);

  const revalidateGallery = async () => {
    try {
      await fetch(`/api/revalidate?tag=gallery`, {
        credentials: "include",
        method: "POST",
        headers: { Authorization: `Bearer: ${process.env.REVALIDATE_KEY}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const assignAlbum = async (ids: string[], album: string | null) => {
    if (ids.length === 0) return false;
    setSaving(true);
    try {
      const res = await fetch(
        new URL(`/api/admin/official-photos/album`, API_BASE),
        {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, album }),
        },
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "unknown");

      const idSet = new Set(ids);
      setPhotos((prev) =>
        prev.map((p) => (idSet.has(p.id) ? { ...p, album } : p)),
      );
      setEditing((prev) => (prev && idSet.has(prev.id) ? { ...prev, album } : prev));
      await revalidateGallery();
      toast.success(
        ids.length > 1
          ? `Обновени ${ids.length} снимки`
          : "Албумът е обновен",
      );
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Неуспешна промяна на албума");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(visiblePhotos.map((p) => p.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const editingUrls = editing ? buildOfficialUrls(editing) : null;

  return (
    <div className="mt-4 border rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="font-medium">Официални снимки ({photos.length})</div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Филтрирай по албум" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>Всички ({photos.length})</SelectItem>
              <SelectItem value={FILTER_NONE}>
                {NO_ALBUM} ({photos.filter((p) => p.album == null).length})
              </SelectItem>
              {albumNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name} ({photos.filter((p) => p.album === name).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk assignment bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium">
            Избрани {selected.size}
          </span>
          <div className="w-64">
            <AlbumCombobox
              value={null}
              albumNames={albumNames}
              disabled={saving}
              onChange={async (album) => {
                const ok = await assignAlbum(Array.from(selected), album);
                if (ok) clearSelection();
              }}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Изчисти избора
          </Button>
        </div>
      )}

      <div className="border-t p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Зареждане…
          </div>
        ) : visiblePhotos.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Няма снимки в този албум
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
              <button
                type="button"
                className="hover:text-foreground hover:underline"
                onClick={selectAllVisible}
              >
                Избери всички ({visiblePhotos.length})
              </button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
              {visiblePhotos.map((photo) => {
                const { thumb } = buildOfficialUrls(photo);
                const isSelected = selected.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`group relative aspect-square overflow-hidden rounded-md border bg-muted ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setEditing(photo)}
                      className="absolute inset-0 h-full w-full cursor-pointer"
                      title={photo.album ?? photo.title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={photo.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                          e.currentTarget.onerror = null;
                        }}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </button>
                    <div
                      className="absolute left-1 top-1 z-10 rounded bg-background/70 p-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelected(photo.id)}
                      />
                    </div>
                    {photo.album && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-[10px] leading-tight text-white">
                        {photo.album}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Single-photo edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate font-notosans text-base font-medium">
              {editing?.title}
            </DialogTitle>
          </DialogHeader>
          {editing && editingUrls && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editingUrls.lq}
                  alt={editing.title}
                  className="max-h-[50vh] w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = editingUrls.thumb;
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Албум</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <AlbumCombobox
                      value={editing.album}
                      albumNames={albumNames}
                      disabled={saving}
                      onChange={(album) => assignAlbum([editing.id], album)}
                    />
                  </div>
                  {saving && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {editing.album && (
                  <Badge variant="secondary" className="mt-1">
                    {editing.album}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
