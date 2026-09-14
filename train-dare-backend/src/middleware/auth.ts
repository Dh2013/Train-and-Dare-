import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { isDatabaseReady } from '../database/connection';
import { AdminUserModel, hasAdminAccess } from '../database/models';

const env = getEnv();
export interface AuthRequest extends Request {
  user?: { id: string; role: string; username?: string; displayName?: string; roles?: string[] };
}

/** Shared by protected writes, /me and optional access to unpublished posts. */
export async function getAuthenticatedAdmin(req: Request): Promise<AuthRequest['user']> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const decoded = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || decoded.role !== 'admin' || !decoded.sub) return undefined;
    if (decoded.sub === 'admin') {
      // No fallback account can bypass MongoDB account revocation or an outage.
      return env.mongoUri ? undefined : { id: 'admin', role: 'admin', username: env.adminUsername };
    }
    if (!isDatabaseReady()) return undefined;
    const admin = await AdminUserModel.findById(decoded.sub)
      .select('username displayName roles status passwordChangedAt').lean();
    if (!admin || admin.status !== 'active' || !hasAdminAccess(admin.roles)) return undefined;
    // Millisecond password version avoids the one-second ambiguity of JWT iat.
    if (admin.passwordChangedAt && decoded.passwordVersion !== admin.passwordChangedAt.getTime()) return undefined;
    return { id: decoded.sub, role: 'admin', username: admin.username, displayName: admin.displayName, roles: admin.roles };
  } catch {
    return undefined;
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await getAuthenticatedAdmin(req);
  if (!user) {
    res.status(401).json({ error: 'Authentification administrateur requise' });
    return;
  }
  (req as AuthRequest).user = user;
  next();
}

export function getJwtSecret(): string { return env.jwtSecret; }
