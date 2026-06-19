import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isDatabaseReady } from '../database/connection';
import { ContactMessageModel } from '../database/models';

const router = Router();
const dataFile = path.join(__dirname, '..', 'data', 'contacts.json');

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

interface ContactRecord extends ContactPayload {
  receivedAt: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Lit le fichier contacts.json et retourne le tableau (ou []).
 */
function readContacts(): ContactRecord[] {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw) ?? [];
  } catch {
    return [];
  }
}

/**
 * Ajoute un message de contact et persiste dans data/contacts.json.
 */
function appendContact(contact: ContactRecord): void {
  const arr = readContacts();
  arr.push(contact);
  fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8');
}

/**
 * POST /api/contact
 * Body: { name, email, message }
 * Enregistre le message et renvoie 201.
 */
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = (req.body || {}) as Partial<ContactPayload>;
  const n = String(name ?? '').trim();
  const e = String(email ?? '').trim();
  const m = String(message ?? '').trim();
  const subject = String(req.body?.subject ?? '').trim();
  const phone = String(req.body?.phone ?? '').trim();
  const sourcePage = String(req.body?.sourcePage ?? req.headers.referer ?? '').trim();

  if (!n || !e || !m) {
    res.status(400).json({ error: 'name, email et message sont requis' });
    return;
  }
  if (!isValidEmail(e)) {
    res.status(400).json({ error: 'email invalide' });
    return;
  }

  const item: ContactRecord = {
    name: n,
    email: e,
    message: m,
    receivedAt: new Date().toISOString(),
  };

  if (isDatabaseReady()) {
    await ContactMessageModel.create({
      fullName: n,
      email: e,
      phone: phone || undefined,
      subject: subject || undefined,
      message: m,
      sourcePage: sourcePage || undefined,
      audienceSegment: 'all',
      newsletterOptIn: Boolean(req.body?.newsletterOptIn),
      consentAccepted: Boolean(req.body?.consentAccepted),
      receivedAt: new Date(item.receivedAt),
      metadata: {
        userAgent: req.get('user-agent') || undefined,
        referral: req.get('origin') || undefined,
      },
    });
  } else {
    appendContact(item);
  }

  res.status(201).json({ status: 'ok' });
});

export default router;
