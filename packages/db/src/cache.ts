import { db } from "./client";
import { and, isNull, lt, not, eq, or, sql } from ".";
import { cacheTable } from "./schema";

type DbType = typeof db;

export default class Cache {
  private db: DbType;

  protected lotteryChance = 1000;

  constructor(dbInstance: DbType, lotteryChance?: number) {
    this.db = dbInstance;
    this.lotteryChance = lotteryChance ?? 1000;
  }

  async set(key: string, value: unknown, ttlMs?: number) {
    const now = new Date();
    const expiresAt = ttlMs ? new Date(now.getTime() + ttlMs) : null;

    await this.db
      .insert(cacheTable)
      .values({
        cacheKey: key,
        cacheValue: JSON.stringify(value),
        createdAt: now,
        updatedAt: now,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: cacheTable.cacheKey,
        set: {
          cacheValue: JSON.stringify(value),
          updatedAt: now,
          expiresAt,
        },
      });

    this.cleanupLottery();
  }

  async get<T>(key: string): Promise<T | null> {
    const now = new Date();

    const row = await this.db
      .select()
      .from(cacheTable)
      .where(
        and(
          eq(cacheTable.cacheKey, key),
          or(
            isNull(cacheTable.expiresAt),
            sql`${cacheTable.expiresAt} > ${now}`
          )
        )
      )
      .limit(1);

    return row.length > 0
      ? (JSON.parse(row[0]!.cacheValue as string) as T)
      : null;
  }

  async remember<T>(
    key: string,
    ttlMs: number,
    cb: () => T | Promise<T> | null
  ): Promise<T | null> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await cb();

    if (value !== null && value !== undefined) {
      await this.set(key, value, ttlMs);
    }

    return value;
  }

  async forget(key: string) {
    await this.db.delete(cacheTable).where(eq(cacheTable.cacheKey, key));
  }

  private async cleanupLottery() {
    const chance = Math.floor(Math.random() * this.lotteryChance);
    if (chance === 0) {
      await this.db
        .delete(cacheTable)
        .where(
          and(
            not(isNull(cacheTable.expiresAt)),
            lt(cacheTable.expiresAt, new Date())
          )
        );
    }
  }
}
