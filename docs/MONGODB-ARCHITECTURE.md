# Train & Dare MongoDB Architecture

## Goal

This backend now includes a MongoDB-ready architecture designed for a modern academy website that needs:

- clean domain separation
- strong validation at the schema level
- future growth for content, leads, enrollments, and admin operations
- a safe migration path from the current JSON files

## Core collections

### `admin_users`

Used for secure back-office access.

Main fields:

- `username` unique, lowercase
- `email` unique when present
- `displayName`
- `passwordHash` stored as a salted scrypt hash
- `roles` such as `super_admin`, `editor`, `author`
- `status`
- `lastLoginAt`

Indexes:

- unique `username`
- sparse unique `email`
- `status`

### `blog_categories`

Used to organize blog content by theme and audience.

Main fields:

- `name`
- `slug` unique
- `description`
- `color`
- `audience`
- `sortOrder`
- `isActive`

Indexes:

- unique `slug`
- `audience`
- `sortOrder`

### `blog_posts`

Used for SEO content and authority building.

Main fields:

- `slug` unique
- `title`
- `excerpt`
- `content.html`
- `content.text`
- `featuredImage`
- `authorName`
- `authorUserId` optional reference to `admin_users`
- `category` reference to `blog_categories`
- `tags`
- `status` as `draft`, `scheduled`, `published`, `archived`
- `scheduledFor`
- `publishedAt`
- `readingTimeMinutes`
- `seo.metaTitle`
- `seo.metaDescription`

Indexes:

- unique `slug`
- compound `status + publishedAt`
- compound `category + status + publishedAt`
- `tags`
- partial index on `scheduledFor` for scheduled posts
- text index on title, excerpt, plain text content, and tags

### `program_spaces`

Represents the major academy universes such as youth, parents, and teachers.

Main fields:

- `slug` unique
- `title`
- `subtitle`
- `description`
- `audience`
- `themeColor`
- `accentColor`
- `displayOrder`
- `isActive`

Indexes:

- unique `slug`
- `audience`
- `displayOrder`

### `program_offerings`

Represents individual programs under a space.

Main fields:

- `space` reference to `program_spaces`
- `spaceSlugSnapshot`
- `slug` unique
- `title`
- `audience`
- `duration`
- `summary`
- `objectives`
- `registrationPath`
- `deliveryMode`
- `status`
- `isFeatured`
- `displayOrder`

Indexes:

- unique `slug`
- compound `space + displayOrder`
- `status`
- text index on title, summary, and objectives

### `contact_messages`

Used for lead capture and support requests.

Main fields:

- `fullName`
- `email`
- `phone`
- `subject`
- `message`
- `sourcePage`
- `audienceSegment`
- `status`
- `tags`
- `newsletterOptIn`
- `consentAccepted`
- `assignedTo`
- `metadata`
- `receivedAt`

Indexes:

- compound `status + createdAt`
- compound `email + createdAt`
- `assignedTo`

### `enrollments`

Used for program applications and admissions workflow.

Main fields:

- `program` optional reference to `program_offerings`
- `programLegacyId`
- `programSlugSnapshot`
- `programTitleSnapshot`
- `spaceSlugSnapshot`
- `fullName`
- `email`
- `phone`
- `ageBand`
- `message`
- `status`
- `preferredContact`
- `source`
- `consentAccepted`
- `receivedAt`

Indexes:

- compound `status + createdAt`
- compound `program + createdAt`
- compound `email + createdAt`

### `newsletter_subscribers`

Supports future newsletter and blog growth loops.

Main fields:

- `email` unique
- `fullName`
- `status`
- `segments`
- `source`
- `tags`
- `subscribedAt`
- `unsubscribedAt`

Indexes:

- unique `email`
- compound `status + source`

### `audit_logs`

Supports traceability for admin actions.

Main fields:

- `actorUser`
- `actorDisplayName`
- `action`
- `entityType`
- `entityId`
- `entityLabel`
- `metadata`
- `ipHash`

Indexes:

- compound `entityType + entityId + createdAt`
- compound `actorUser + createdAt`

## Relationships

- One `program_space` has many `program_offerings`
- One `blog_category` has many `blog_posts`
- One `admin_user` can author many `blog_posts`
- One `admin_user` can be assigned many `contact_messages`
- One `program_offering` can receive many `enrollments`

## Security design

- Admin passwords are hashed with salted `scrypt`
- JWT settings are centralized in `src/config/env.ts`
- Sensitive defaults are flagged at startup
- MongoDB connection is optional by default and can be made mandatory with `MONGODB_REQUIRED=true`
- Common schema serialization removes `_id` / `__v` noise and exposes a clean `id`

## Runtime behavior

The backend now works in two modes:

1. File-backed fallback mode
   - If `MONGODB_URI` is missing, the existing JSON behavior remains available.
2. MongoDB mode
   - The server connects to MongoDB at startup.
   - Auth uses `admin_users` when available.
   - Contact submissions and enrollments write to MongoDB.
   - Program reads use MongoDB when seeded, then fall back to JSON if the database is still empty.

The blog routes already have a complete JSON workflow. The MongoDB blog models and seed are now ready for a later route migration without redesigning the schema.

## Files added

- `train-dare-backend/src/config/env.ts`
- `train-dare-backend/src/database/connection.ts`
- `train-dare-backend/src/database/plugins/applyBaseSchema.ts`
- `train-dare-backend/src/database/models/*`
- `train-dare-backend/src/database/scripts/seedFromJson.ts`
- `train-dare-backend/.env.example`

## How to use

1. Copy `.env.example` to `.env`
2. Fill `MONGODB_URI`, `JWT_SECRET`, and secure admin credentials
3. Start MongoDB
4. Run `npm run db:seed` inside `train-dare-backend`
5. Start the API with `npm run dev` or `npm run start`

## Recommended next steps

- Migrate the blog routes from JSON persistence to MongoDB repositories
- Add admin CRUD endpoints for programs, newsletter subscribers, and contact pipeline states
- Add rate limiting and request logging on public lead endpoints
- Add a backup strategy and MongoDB monitoring for production
