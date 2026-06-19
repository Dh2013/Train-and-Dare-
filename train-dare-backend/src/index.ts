/**
 * Train & Dare – API backend
 * Express + TypeScript, données en JSON (programmes, blog, contact, inscriptions, auth).
 */
import express from 'express';
import cors from 'cors';
import { getEnv, getSecurityWarnings } from './config/env';
import { connectToDatabase, getDatabaseStatus } from './database/connection';
import programsRouter from './routes/programs';
import blogsRouter from './routes/blogs';
import contactRouter from './routes/contact';
import inscriptionsRouter from './routes/inscriptions';
import authRouter from './routes/auth';

const app = express();
const env = getEnv();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/programs', programsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/inscriptions', inscriptionsRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: getDatabaseStatus(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Train & Dare backend running',
    database: getDatabaseStatus(),
  });
});

async function bootstrap(): Promise<void> {
  for (const warning of getSecurityWarnings()) {
    console.warn(`[config] ${warning}`);
  }

  await connectToDatabase();

  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

void bootstrap().catch((error: unknown) => {
  console.error('[bootstrap] failed to start backend', error);
  process.exit(1);
});
