import { Request, Response, NextFunction } from 'express';

/** In-memory limit for this process only. Never trust client-supplied forwarding headers. */
export function createLoginRateLimit(now = Date.now) {
  const attempts = new Map<string, { count: number; expires: number }>();
  const windowMs = 15 * 60 * 1000;
  return (req: Request, res: Response, next: NextFunction): void => {
    const time = now();
    for (const [key, entry] of attempts) if (entry.expires <= time) attempts.delete(key);
    const key = req.socket.remoteAddress ?? 'unknown';
    let entry = attempts.get(key);
    if (!entry && attempts.size < 10000) {
      entry = { count: 0, expires: time + windowMs };
      attempts.set(key, entry);
    }
    if (!entry || entry.count >= 10) {
      res.setHeader('Retry-After', String(Math.ceil(((entry?.expires ?? time + windowMs) - time) / 1000)));
      res.status(429).json({ error: 'Trop de tentatives. Reessayez plus tard.' });
      return;
    }
    entry.count += 1;
    next();
  };
}
