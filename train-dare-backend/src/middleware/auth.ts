import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';

const JWT_SECRET = getEnv().jwtSecret;

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Attache l'utilisateur décodé à la requête */
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

/**
 * Middleware : exige un token JWT valide avec rôle admin.
 * Utilisé pour protéger les routes d'administration (éditeur, mutations blog).
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentification requise' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      return;
    }
    (req as AuthRequest).user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

export function getJwtSecret(): string {
  return JWT_SECRET;
}
