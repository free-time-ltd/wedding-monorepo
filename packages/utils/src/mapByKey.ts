export default function mapByKey<
  T extends Record<string | number | symbol, unknown>,
  K extends keyof T,
>(arr: readonly T[], key: K): Map<T[K], T> {
  if (!Array.isArray(arr)) {
    throw new Error("mapByKey only works with arrays");
  }

  return arr.reduce((aggr, cur) => {
    if (key in cur) {
      aggr.set(cur[key], cur);
    }
    return aggr;
  }, new Map<T[K], T>());
}
