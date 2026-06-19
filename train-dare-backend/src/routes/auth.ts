import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { isDatabaseReady } from '../database/connection';
import { AdminUserModel, hasAdminAccess } from '../database/models';
import { getJwtSecret } from '../middleware/auth';

const router = Router();
const env = getEnv();
/** Expiration du JWT en secondes (défaut 7 jours) */
const JWT_EXPIRES_SEC = env.jwtExpiresSec;

async function authenticateWithMongo(username: string, password: string) {
  if (!isDatabaseReady()) {
    return null;
  }

  const admin = await AdminUserModel.findOne({
    username: username.toLowerCase(),
    status: 'active',
  }).select('+passwordHash');

  if (!admin || !hasAdminAccess(admin.roles) || !admin.verifyPassword(password)) {
    return null;
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  return admin;
}

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Retourne un token JWT si les identifiants correspondent à l'admin.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const u = String(username ?? '').trim();
  const p = String(password ?? '');

  if (!u || !p) {
    res.status(400).json({ error: 'Identifiants requis' });
    return;
  }

  const mongoAdmin = await authenticateWithMongo(u, p);
  if (mongoAdmin) {
    const adminId = String(mongoAdmin._id);
    const secret = getJwtSecret();
    const token = jwt.sign({ sub: adminId, role: 'admin' }, secret, {
      expiresIn: JWT_EXPIRES_SEC,
    });

    res.json({
      token,
      user: {
        id: adminId,
        role: 'admin',
        username: mongoAdmin.username,
        displayName: mongoAdmin.displayName,
        roles: mongoAdmin.roles,
      },
    });
    return;
  }

  if (u.toLowerCase() !== env.adminUsername || p !== env.adminPassword) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  const secret = getJwtSecret();
  const token = jwt.sign({ sub: 'admin', role: 'admin' }, secret, { expiresIn: JWT_EXPIRES_SEC });

  res.json({ token, user: { role: 'admin', username: u } });
});

/**
 * GET /api/auth/me
 * Vérifie le token (Authorization: Bearer <token>) et retourne l'utilisateur courant.
 * Utilisé côté client pour savoir si la session admin est valide et afficher le bouton.
 */
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { sub: string; role: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Rôle insuffisant' });
      return;
    }

    if (isDatabaseReady() && decoded.sub !== 'admin') {
      const admin = await AdminUserModel.findById(decoded.sub)
        .select('username displayName roles status')
        .lean();

      if (admin && admin.status === 'active') {
        res.json({
          user: {
            id: decoded.sub,
            role: 'admin',
            username: admin.username,
            displayName: admin.displayName,
            roles: admin.roles,
          },
        });
        return;
      }
    }

    res.json({ user: { role: 'admin', id: decoded.sub } });
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
});

export default router;
