import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isDatabaseReady } from '../database/connection';
import { ProgramOfferingModel, ProgramSpaceModel } from '../database/models';

const router = Router();
const dataFile = path.join(__dirname, '..', 'data', 'programs.json');

/** Univers : Ado-preneur, Parent & Ado, Enseignants */
export interface Programme {
  id: string;
  slug: string;
  titre: string;
  public: string;
  duree: string;
  objectifs: string[];
  lienInscription: string;
}

export interface Univers {
  id: string;
  slug: string;
  titre: string;
  sousTitre: string;
  description: string;
  programmes: Programme[];
}

function readPrograms(): Univers[] {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatProgramOffering(offering: {
  id?: string;
  legacyId?: string;
  slug: string;
  title: string;
  audience: string;
  duration: string;
  objectives: string[];
  registrationPath: string;
}): Programme {
  return {
    id: offering.legacyId || offering.id || offering.slug,
    slug: offering.slug,
    titre: offering.title,
    public: offering.audience,
    duree: offering.duration,
    objectifs: offering.objectives,
    lienInscription: offering.registrationPath,
  };
}

async function readProgramsFromDatabase(): Promise<Univers[]> {
  const spaces = await ProgramSpaceModel.find({ isActive: true })
    .sort({ displayOrder: 1, title: 1 })
    .lean();

  if (!spaces.length) {
    return [];
  }

  const offerings = await ProgramOfferingModel.find({
    status: 'published',
    space: { $in: spaces.map((space) => space._id) },
  })
    .sort({ displayOrder: 1, title: 1 })
    .lean();

  return spaces.map((space) => ({
    id: space.legacyId || String(space._id),
    slug: space.slug,
    titre: space.title,
    sousTitre: space.subtitle,
    description: space.description,
    programmes: offerings
      .filter((offering) => String(offering.space) === String(space._id))
      .map((offering) => formatProgramOffering(offering)),
  }));
}

/**
 * GET /api/programs
 * Liste tous les univers avec leurs programmes.
 * Query: ?univers=ado-preneur|parent-ado|enseignants pour filtrer.
 */
router.get('/', async (req: Request, res: Response) => {
  const universSlug = (req.query.univers as string)?.toLowerCase()?.trim();
  let data = readPrograms();

  if (isDatabaseReady()) {
    const databasePrograms = await readProgramsFromDatabase();
    if (databasePrograms.length) {
      data = databasePrograms;
    }
  }

  if (universSlug) {
    data = data.filter((u: Univers) => u.slug === universSlug);
  }
  res.json(data);
});

/**
 * GET /api/programs/:id
 * Retourne un univers ou un programme par id/slug.
 * On cherche d'abord un univers par id/slug, puis un programme (id ou slug) dans tous les univers.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const idOrSlug = req.params.id?.trim();
  if (!idOrSlug) return res.status(400).json({ error: 'id ou slug requis' });

  if (isDatabaseReady()) {
    const universeMatch = await ProgramSpaceModel.findOne({
      $or: [{ legacyId: idOrSlug }, { slug: idOrSlug }],
      isActive: true,
    })
      .select('id legacyId slug title subtitle description')
      .lean();

    if (universeMatch) {
      const programmes = await ProgramOfferingModel.find({
        space: universeMatch._id,
        status: 'published',
      })
        .sort({ displayOrder: 1, title: 1 })
        .lean();

      res.json({
        id: universeMatch.legacyId || String(universeMatch._id),
        slug: universeMatch.slug,
        titre: universeMatch.title,
        sousTitre: universeMatch.subtitle,
        description: universeMatch.description,
        programmes: programmes.map((programme) => formatProgramOffering(programme)),
      });
      return;
    }

    const programme = await ProgramOfferingModel.findOne({
      $or: [{ legacyId: idOrSlug }, { slug: idOrSlug }],
      status: 'published',
    })
      .select('id legacyId slug title audience duration objectives registrationPath space')
      .lean();

    if (programme) {
      const universe = await ProgramSpaceModel.findById(programme.space)
        .select('id legacyId slug title')
        .lean();

      res.json({
        ...formatProgramOffering(programme),
        univers: universe
          ? {
              id: universe.legacyId || String(universe._id),
              slug: universe.slug,
              titre: universe.title,
            }
          : undefined,
      });
      return;
    }
  }

  const univers = readPrograms();
  const universMatch = univers.find((u: Univers) => u.id === idOrSlug || u.slug === idOrSlug);
  if (universMatch) return res.json(universMatch);

  for (const u of univers) {
    const prog = u.programmes.find((p: Programme) => p.id === idOrSlug || p.slug === idOrSlug);
    if (prog) return res.json({ ...prog, univers: { id: u.id, slug: u.slug, titre: u.titre } });
  }
  res.status(404).json({ error: 'Programme ou univers non trouvé' });
});

export default router;
