import fs from 'fs';
import path from 'path';
import {
  AdminUserModel,
  BlogCategoryModel,
  BlogPostModel,
  ContactMessageModel,
  EnrollmentModel,
  ProgramOfferingModel,
  ProgramSpaceModel,
} from '../models';
import { connectToDatabase, disconnectFromDatabase, isDatabaseConfigured } from '../connection';
import { getEnv } from '../../config/env';
import { slugify } from '../utils/slug';
import { stripHtml, truncateText } from '../utils/text';

interface JsonProgram {
  id?: string;
  slug?: string;
  titre?: string;
  public?: string;
  duree?: string;
  objectifs?: string[];
  lienInscription?: string;
}

interface JsonProgramSpace {
  id?: string;
  slug?: string;
  titre?: string;
  sousTitre?: string;
  description?: string;
  programmes?: JsonProgram[];
}

interface JsonBlogCategory {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  audience?: 'adult' | 'youth' | 'all';
}

interface JsonBlogPost {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'scheduled' | 'published';
  scheduledFor?: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface JsonContact {
  name?: string;
  email?: string;
  message?: string;
  receivedAt?: string;
}

interface JsonEnrollment {
  id?: string;
  programmeId?: string;
  programmeSlug?: string;
  nom?: string;
  email?: string;
  trancheAge?: string;
  telephone?: string;
  message?: string;
  receivedAt?: string;
}

const dataDir = path.join(process.cwd(), 'src', 'data');

function readJsonFile<T>(filename: string, fallback: T): T {
  const filePath = path.join(dataDir, filename);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseOptionalDate(value: string | undefined): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function isValidEmail(value: string | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

function getSpaceAudience(slug: string): 'youth' | 'parents' | 'teachers' | 'mixed' {
  if (slug === 'ado-preneur') {
    return 'youth';
  }
  if (slug === 'parent-ado') {
    return 'parents';
  }
  if (slug === 'enseignants') {
    return 'teachers';
  }
  return 'mixed';
}

function getSpacePalette(slug: string): { themeColor: string; accentColor: string } {
  if (slug === 'ado-preneur') {
    return { themeColor: '#0E9F6E', accentColor: '#F97316' };
  }
  if (slug === 'parent-ado') {
    return { themeColor: '#166534', accentColor: '#F59E0B' };
  }
  if (slug === 'enseignants') {
    return { themeColor: '#14532D', accentColor: '#38BDF8' };
  }
  return { themeColor: '#0E9F6E', accentColor: '#F97316' };
}

function getDeliveryMode(program: JsonProgram): 'cohort' | 'bootcamp' | 'workshop' | 'custom' {
  const combined = `${program.titre ?? ''} ${program.duree ?? ''}`.toLowerCase();

  if (combined.includes('bootcamp') || combined.includes('stage vacances') || combined.includes('intensif')) {
    return 'bootcamp';
  }
  if (combined.includes('atelier')) {
    return 'workshop';
  }
  if (combined.includes('sur mesure')) {
    return 'custom';
  }

  return 'cohort';
}

async function seedAdminUser(): Promise<void> {
  const env = getEnv();
  const username = env.adminUsername;
  const fallbackEmail = 'admin@trainanddare.local';

  let admin = await AdminUserModel.findOne({ username }).select('+passwordHash');

  if (!admin) {
    admin = new AdminUserModel({
      username,
      email: fallbackEmail,
      displayName: 'Train & Dare Admin',
      roles: ['super_admin'],
      status: 'active',
      passwordHash: 'temporary',
    });
  }

  admin.displayName = admin.displayName || 'Train & Dare Admin';
  admin.email = admin.email || fallbackEmail;
  admin.roles = admin.roles.length ? admin.roles : ['super_admin'];
  admin.status = admin.status || 'active';
  admin.setPassword(env.adminPassword);
  await admin.save();
  console.log(`[seed] admin user upserted: ${username}`);
}

async function seedProgramSpaces(): Promise<Map<string, { id: string; title: string; slug: string }>> {
  const spaces = readJsonFile<JsonProgramSpace[]>('programs.json', []);
  const spaceMap = new Map<string, { id: string; title: string; slug: string }>();

  for (const [spaceIndex, space] of spaces.entries()) {
    const slug = slugify(space.slug || space.titre || `space-${spaceIndex + 1}`);
    const palette = getSpacePalette(slug);
    const savedSpace = await ProgramSpaceModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          legacyId: space.id,
          title: space.titre?.trim() || slug,
          subtitle: space.sousTitre?.trim() || '',
          description: space.description?.trim() || '',
          audience: getSpaceAudience(slug),
          themeColor: palette.themeColor,
          accentColor: palette.accentColor,
          displayOrder: spaceIndex,
          isActive: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    spaceMap.set(slug, {
      id: String(savedSpace._id),
      title: savedSpace.title,
      slug: savedSpace.slug,
    });

    for (const [programIndex, program] of (space.programmes ?? []).entries()) {
      const programSlug = slugify(program.slug || program.titre || `${slug}-programme-${programIndex + 1}`);
      const objectives = Array.isArray(program.objectifs)
        ? program.objectifs.map((objective) => objective.trim()).filter(Boolean)
        : [];

      await ProgramOfferingModel.findOneAndUpdate(
        { slug: programSlug },
        {
          $set: {
            legacyId: program.id,
            space: savedSpace._id,
            spaceSlugSnapshot: savedSpace.slug,
            title: program.titre?.trim() || programSlug,
            audience: program.public?.trim() || 'Tous publics',
            duration: program.duree?.trim() || 'A definir',
            summary: truncateText(objectives.join(' '), 500) || undefined,
            objectives,
            registrationPath: (program.lienInscription ?? programSlug).trim(),
            deliveryMode: getDeliveryMode(program),
            status: 'published',
            isFeatured: programIndex === 0,
            displayOrder: programIndex,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  console.log(`[seed] program spaces upserted: ${spaceMap.size}`);
  return spaceMap;
}

async function seedBlogCategories(): Promise<Map<string, string>> {
  const categories = readJsonFile<JsonBlogCategory[]>('blog-categories.json', []);
  const categoryMap = new Map<string, string>();

  for (const [index, category] of categories.entries()) {
    const slug = slugify(category.slug || category.name || `category-${index + 1}`);
    const savedCategory = await BlogCategoryModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          legacyId: category.id,
          name: category.name?.trim() || slug,
          description: category.description?.trim() || '',
          color: category.color?.trim() || '#0E9F6E',
          audience: category.audience || 'all',
          sortOrder: index,
          isActive: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    categoryMap.set(slug, String(savedCategory._id));
  }

  console.log(`[seed] blog categories upserted: ${categoryMap.size}`);
  return categoryMap;
}

async function seedBlogPosts(categoryMap: Map<string, string>): Promise<void> {
  const posts = readJsonFile<JsonBlogPost[]>('blogs.json', []);
  const defaultCategoryId = categoryMap.values().next().value as string | undefined;

  for (const post of posts) {
    const slug = slugify(post.slug || post.title || `blog-${Date.now()}`);
    const categoryId = categoryMap.get(slugify(post.category || '')) || defaultCategoryId;

    if (!categoryId) {
      continue;
    }

    const contentHtml = post.content?.trim() || '<p>Coming soon.</p>';
    const contentText = stripHtml(contentHtml);
    const excerpt = truncateText(post.excerpt?.trim() || contentText, 320);
    const status = post.status === 'published' || post.status === 'scheduled' ? post.status : 'draft';

    await BlogPostModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          legacyId: post.id,
          title: post.title?.trim() || slug,
          excerpt,
          content: {
            html: contentHtml,
            text: contentText,
          },
          featuredImage: post.featuredImage?.trim()
            ? {
                url: post.featuredImage.trim(),
                alt: post.featuredImageAlt?.trim() || post.title?.trim() || slug,
              }
            : undefined,
          authorName: post.author?.trim() || 'Train & Dare Academy',
          category: categoryId,
          tags: Array.isArray(post.tags) ? post.tags : [],
          status,
          scheduledFor: parseOptionalDate(post.scheduledFor),
          publishedAt: parseOptionalDate(post.publishedAt),
          seo: {
            metaTitle: truncateText(post.metaTitle?.trim() || post.title?.trim() || slug, 70),
            metaDescription: truncateText(post.metaDescription?.trim() || excerpt, 170),
            canonicalUrl: `/blog/${slug}`,
            openGraphImage: post.featuredImage?.trim() || undefined,
          },
          relatedPosts: [],
          isFeatured: false,
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`[seed] blog posts upserted: ${posts.length}`);
}

async function seedContacts(): Promise<void> {
  const contacts = readJsonFile<JsonContact[]>('contacts.json', []);
  let count = 0;

  for (const contact of contacts) {
    if (!contact.name?.trim() || !isValidEmail(contact.email) || !contact.message?.trim()) {
      continue;
    }

    const receivedAt = parseOptionalDate(contact.receivedAt) || new Date();
    await ContactMessageModel.updateOne(
      {
        email: contact.email.trim().toLowerCase(),
        message: contact.message.trim(),
        receivedAt,
      },
      {
        $setOnInsert: {
          fullName: contact.name.trim(),
          email: contact.email.trim().toLowerCase(),
          message: contact.message.trim(),
          status: 'new',
          audienceSegment: 'all',
          newsletterOptIn: false,
          consentAccepted: false,
          receivedAt,
        },
      },
      { upsert: true }
    );
    count += 1;
  }

  console.log(`[seed] contact messages upserted: ${count}`);
}

async function seedEnrollments(
  spaceMap: Map<string, { id: string; title: string; slug: string }>
): Promise<void> {
  const enrollments = readJsonFile<JsonEnrollment[]>('inscriptions.json', []);
  let count = 0;

  for (const enrollment of enrollments) {
    if (!enrollment.nom?.trim() || !isValidEmail(enrollment.email) || !enrollment.programmeId?.trim()) {
      continue;
    }

    const matchedProgram = await ProgramOfferingModel.findOne({
      $or: [
        { legacyId: enrollment.programmeId.trim() },
        { slug: slugify(enrollment.programmeSlug || enrollment.programmeId) },
      ],
    })
      .select('id slug title spaceSlugSnapshot')
      .lean();

    const fallbackSpace = enrollment.programmeSlug
      ? spaceMap.get(slugify(enrollment.programmeSlug.split('/')[0] || ''))
      : undefined;
    const receivedAt = parseOptionalDate(enrollment.receivedAt) || new Date();

    await EnrollmentModel.updateOne(
      enrollment.id
        ? { legacyId: enrollment.id }
        : {
            email: enrollment.email.trim().toLowerCase(),
            programLegacyId: enrollment.programmeId.trim(),
            receivedAt,
          },
      {
        $setOnInsert: {
          legacyId: enrollment.id,
          program: matchedProgram?._id,
          programLegacyId: enrollment.programmeId.trim(),
          programSlugSnapshot:
            matchedProgram?.slug || slugify(enrollment.programmeSlug || enrollment.programmeId),
          programTitleSnapshot: matchedProgram?.title || undefined,
          spaceSlugSnapshot: matchedProgram?.spaceSlugSnapshot || fallbackSpace?.slug,
          fullName: enrollment.nom.trim(),
          email: enrollment.email.trim().toLowerCase(),
          phone: enrollment.telephone?.trim() || undefined,
          ageBand: enrollment.trancheAge?.trim() || undefined,
          message: enrollment.message?.trim() || undefined,
          status: 'submitted',
          source: 'json-import',
          consentAccepted: false,
          tags: [],
          preferredContact: enrollment.telephone?.trim() ? 'phone' : 'email',
          receivedAt,
        },
      },
      { upsert: true }
    );
    count += 1;
  }

  console.log(`[seed] enrollments upserted: ${count}`);
}

async function main(): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error('MONGODB_URI is required before running the MongoDB seed script.');
  }

  const connected = await connectToDatabase();
  if (!connected) {
    throw new Error('Could not connect to MongoDB for seeding.');
  }

  await seedAdminUser();
  const spaceMap = await seedProgramSpaces();
  const categoryMap = await seedBlogCategories();
  await seedBlogPosts(categoryMap);
  await seedContacts();
  await seedEnrollments(spaceMap);
}

void main()
  .then(async () => {
    console.log('[seed] MongoDB seed completed successfully.');
    await disconnectFromDatabase();
  })
  .catch(async (error: unknown) => {
    console.error('[seed] MongoDB seed failed', error);
    await disconnectFromDatabase();
    process.exitCode = 1;
  });
