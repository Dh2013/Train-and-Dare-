import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isDatabaseReady } from '../database/connection';
import { EnrollmentModel, ProgramOfferingModel } from '../database/models';

const router = Router();
const dataFile = path.join(__dirname, '..', 'data', 'inscriptions.json');

/** Candidature à un programme (inscription) */
export interface Inscription {
  id?: string;
  programmeId: string;
  programmeSlug?: string;
  nom: string;
  email: string;
  trancheAge?: string;
  telephone?: string;
  message?: string;
  receivedAt: string;
}

const MAX_NOM = 200;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;
const MAX_TELEPHONE = 30;
const MAX_TRANCHE_AGE = 50;

function readInscriptions(): Inscription[] {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeInscriptions(data: Inscription[]) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(): string {
  return 'ins-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Validation basique email */
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * POST /api/inscriptions
 * Enregistre une candidature (demande d'inscription) pour un programme.
 * Corps : programmeId, nom, email, trancheAge?, telephone?, message?
 */
router.post('/', async (req: Request, res: Response) => {
  const body = req.body || {};
  const programmeId = String(body.programmeId ?? '').trim();
  const nom = String(body.nom ?? '').trim();
  const email = String(body.email ?? '').trim();
  const trancheAge = String(body.trancheAge ?? '').trim().slice(0, MAX_TRANCHE_AGE);
  const telephone = String(body.telephone ?? '').trim().slice(0, MAX_TELEPHONE);
  const message = String(body.message ?? '').trim().slice(0, MAX_MESSAGE);

  if (!programmeId) return res.status(400).json({ error: 'programmeId est requis' });
  if (!nom) return res.status(400).json({ error: 'Le nom est requis' });
  if (nom.length > MAX_NOM) return res.status(400).json({ error: 'Nom trop long' });
  if (!email) return res.status(400).json({ error: "L'email est requis" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Email invalide" });
  if (email.length > MAX_EMAIL) return res.status(400).json({ error: 'Email trop long' });

  const inscription: Inscription = {
    id: generateId(),
    programmeId,
    programmeSlug: body.programmeSlug?.trim?.() || undefined,
    nom,
    email,
    trancheAge: trancheAge || undefined,
    telephone: telephone || undefined,
    message: message || undefined,
    receivedAt: new Date().toISOString(),
  };

  const data = readInscriptions();

  if (isDatabaseReady()) {
    const matchedProgram = await ProgramOfferingModel.findOne({
      $or: [
        { legacyId: programmeId },
        { slug: String(body.programmeSlug ?? '').trim().toLowerCase() },
      ],
    })
      .select('id slug title spaceSlugSnapshot')
      .lean();

    await EnrollmentModel.create({
      legacyId: inscription.id,
      program: matchedProgram?._id,
      programLegacyId: programmeId,
      programSlugSnapshot:
        matchedProgram?.slug || inscription.programmeSlug?.trim().toLowerCase() || programmeId.toLowerCase(),
      programTitleSnapshot: matchedProgram?.title || undefined,
      spaceSlugSnapshot: matchedProgram?.spaceSlugSnapshot || undefined,
      fullName: nom,
      email,
      ageBand: trancheAge || undefined,
      phone: telephone || undefined,
      message: message || undefined,
      status: 'submitted',
      source: String(body.source ?? 'website').trim(),
      consentAccepted: Boolean(body.consentAccepted),
      preferredContact:
        body.preferredContact === 'phone' ||
        body.preferredContact === 'whatsapp' ||
        body.preferredContact === 'email'
          ? body.preferredContact
          : undefined,
      receivedAt: new Date(inscription.receivedAt),
    });
  } else {
    data.push(inscription);
    writeInscriptions(data);
  }

  res.status(201).json({ status: 'ok', id: inscription.id });
});

export default router;
