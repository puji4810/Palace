const WINDOW_MS = 10 * 60 * 1000;
const DECAY_MS = 30 * 60 * 1000;
const BACKOFF_MS = [5_000, 15_000, 60_000, 300_000];

/**
 * Small in-memory, progressive rate limiter. It never locks an account
 * permanently: strikes decay and the delay is capped at five minutes.
 */
export class RateLimiter {
  constructor() {
    /** @type {Map<string, {strikes: number, lastFail: number, blockedUntil: number}>} */
    this.entries = new Map();
    this.sweeper = setInterval(() => this.sweep(), 5 * 60 * 1000);
    this.sweeper.unref?.();
  }

  entry(key, now) {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { strikes: 0, lastFail: 0, blockedUntil: 0 };
      this.entries.set(key, entry);
    }
    if (entry.lastFail > 0 && now - entry.lastFail > DECAY_MS) {
      entry.strikes = 0;
      entry.blockedUntil = 0;
    }
    return entry;
  }

  /** @returns {{ ok: boolean, retryAfterMs: number, strikes: number }} */
  check(key, now = Date.now()) {
    const entry = this.entry(key, now);
    if (entry.blockedUntil > now) {
      return { ok: false, retryAfterMs: entry.blockedUntil - now, strikes: entry.strikes };
    }
    return { ok: true, retryAfterMs: 0, strikes: entry.strikes };
  }

  fail(key, now = Date.now()) {
    const entry = this.entry(key, now);
    entry.strikes += 1;
    entry.lastFail = now;
    const delay = BACKOFF_MS[Math.min(entry.strikes - 5, BACKOFF_MS.length - 1)] ?? 0;
    entry.blockedUntil = entry.strikes >= 5 ? now + delay : 0;
    return delay;
  }

  succeed(key) {
    this.entries.delete(key);
  }

  sweep() {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (entry.lastFail > 0 && now - entry.lastFail > WINDOW_MS && entry.blockedUntil <= now) {
        this.entries.delete(key);
      }
    }
  }

  close() {
    clearInterval(this.sweeper);
  }
}
