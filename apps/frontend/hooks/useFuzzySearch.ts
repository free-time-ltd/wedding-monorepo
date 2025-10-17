import { useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

export function useFuzzySearch<T>(dictionary: T[], options?: IFuseOptions<T>) {
  const fuse = useMemo(
    () =>
      new Fuse(dictionary, { includeScore: true, threshold: 0.4, ...options }),
    [dictionary, options]
  );

  const search = (query: string) => {
    if (!query || query.trim().length === 0) return dictionary;

    return fuse.search(query).map((result) => result.item);
  };

  const searchRaw = (query: string) => fuse.search(query);

  return { search, searchRaw };
}
