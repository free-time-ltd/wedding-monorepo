export default function mapByKey<
  T extends Record<K, unknown>,
  K extends keyof T,
>(arr: readonly T[], key: K): Map<T[K], T | T[]> {
  if (!Array.isArray(arr)) {
    throw new Error("mapByKey only works with arrays");
  }

  return arr.reduce((aggr, cur) => {
    const groupKey = cur[key];
    const existing = aggr.get(groupKey);

    if (!existing) {
      // first entry
      aggr.set(groupKey, cur);
    } else if (Array.isArray(existing)) {
      // already multi
      existing.push(cur);
    } else {
      // convert single → array
      aggr.set(groupKey, [existing, cur]);
    }
    return aggr;
  }, new Map<T[K], T>());
}
