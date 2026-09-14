import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { isDatabaseReady } from '../database/connection';
import { AdminUserModel, hasAdminAccess } from '../database/models';
import { AuthRequest, getJwtSecret, requireAdmin } from '../middleware/auth';
import { createLoginRateLimit } from '../middleware/loginRateLimit';

const router = Router();
const env = getEnv();

router.post('/login', createLoginRateLimit(), async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password || username.length > 80 || password.length > 1024) {
    res.status(400).json({ error: 'Identifiants requis' });
    return;
  }
  const u = username.trim().toLowerCase();
  try {
    if (env.mongoUri) {
      if (!isDatabaseReady()) {
        res.status(503).json({ error: 'Authentification temporairement indisponible' });
        return;
      }
      const admin = await AdminUserModel.findOne({ username: u, status: 'active' }).select('+passwordHash');
      if (!admin || !hasAdminAccess(admin.roles) || !admin.verifyPassword(password)) {
        res.status(401).json({ error: 'Identifiants incorrects' });
        return;
      }
      admin.lastLoginAt = new Date();
      await admin.save();
      const id = String(admin._id);
      const token = jwt.sign({ sub: id, role: 'admin', passwordVersion: admin.passwordChangedAt?.getTime() }, getJwtSecret(), { expiresIn: env.jwtExpiresSec });
      res.json({ token, user: { id, role: 'admin', username: admin.username, displayName: admin.displayName, roles: admin.roles } });
      return;
    }
    if (u !== env.adminUsername || password !== env.adminPassword) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }
    const token = jwt.sign({ sub: 'admin', role: 'admin' }, getJwtSecret(), { expiresIn: env.jwtExpiresSec });
    res.json({ token, user: { role: 'admin', username: u } });
  } catch {
    res.status(503).json({ error: 'Authentification temporairement indisponible' });
  }
});

router.get('/me', requireAdmin, (req, res) => res.json({ user: (req as AuthRequest).user }));
export default router;
