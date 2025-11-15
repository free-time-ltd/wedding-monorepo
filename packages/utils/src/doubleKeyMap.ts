export default class DoubleKeyMap<K1, K2, T> {
  private map = new Map<K1, Map<K2, T>>();

  set(k1: K1, k2: K2, value: T) {
    if (!this.map.has(k1)) this.map.set(k1, new Map());
    this.map.get(k1)!.set(k2, value);
  }

  get(k1: K1, k2: K2): T | undefined;
  get<D>(k1: K1, k2: K2, defaultReturn: D): T | D;
  get<D>(k1: K1, k2: K2, defaultReturn?: D): T | D | undefined {
    const value = this.map.get(k1)?.get(k2);
    return (value ?? defaultReturn) as T | D | undefined;
  }

  delete(k1: K1, k2: K2) {
    this.map.get(k1)?.delete(k2);
  }

  has(k1: K1, k2: K2) {
    return this.map.get(k1)?.has(k2) ?? false;
  }
}
