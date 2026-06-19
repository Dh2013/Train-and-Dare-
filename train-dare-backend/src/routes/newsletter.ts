import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isDatabaseReady } from '../database/connection';
import { NewsletterSubscriberModel } from '../database/models';

const router = Router();
const dataFile = path.join(__dirname, '..', 'data', 'newsletter.json');

interface NewsletterRecord {
  email: string;
  fullName?: string;
  source?: string;
  segments: string[];
  tags: string[];
  subscribedAt: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12)
    )
  );
}

function readSubscribers(): NewsletterRecord[] {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubscribers(records: NewsletterRecord[]): void {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
}

router.post('/', async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const fullName = String(req.body?.fullName ?? '').trim().slice(0, 160);
  const source = String(req.body?.source ?? 'website').trim().slice(0, 200);
  const segments = normalizeList(req.body?.segments);
  const tags = normalizeList(req.body?.tags);

  if (!email) {
    res.status(400).json({ error: 'email est requis' });
    return;
  }

  if (!isValidEmail(email) || email.length > 254) {
    res.status(400).json({ error: 'email invalide' });
    return;
  }

  if (isDatabaseReady()) {
    await NewsletterSubscriberModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          fullName: fullName || undefined,
          source,
          status: 'active',
          unsubscribedAt: undefined,
        },
        $addToSet: {
          segments: { $each: segments },
          tags: { $each: tags },
        },
        $setOnInsert: {
          subscribedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );
  } else {
    const records = readSubscribers();
    const existingIndex = records.findIndex((record) => record.email === email);
    const nextRecord: NewsletterRecord = {
      email,
      fullName: fullName || undefined,
      source,
      segments,
      tags,
      subscribedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      records[existingIndex] = {
        ...records[existingIndex],
        ...nextRecord,
        segments: Array.from(new Set([...records[existingIndex].segments, ...segments])),
        tags: Array.from(new Set([...records[existingIndex].tags, ...tags])),
      };
    } else {
      records.push(nextRecord);
    }

    writeSubscribers(records);
  }

  res.status(201).json({
    status: 'ok',
    message: 'Inscription newsletter enregistree',
  });
});

export default router;
