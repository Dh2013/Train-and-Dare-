import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Model, Schema, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { normalizeEmail } from '../utils/text';

export type AdminRole = 'super_admin' | 'editor' | 'author';
export type AdminStatus = 'active' | 'disabled' | 'invited';

export interface AdminUser {
  username: string;
  email?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  roles: AdminRole[];
  status: AdminStatus;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
}

export interface AdminUserMethods {
  setPassword(password: string): void;
  verifyPassword(password: string): boolean;
}

type AdminUserModelType = Model<AdminUser, Record<string, never>, AdminUserMethods>;

function assertPasswordPresent(password: string): void {
  if (!password.trim()) {
    throw new Error('Admin password cannot be empty.');
  }
}

export function hashAdminPassword(password: string): string {
  assertPasswordPresent(password);
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyAdminPasswordHash(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const computed = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');

  if (stored.length !== computed.length) {
    return false;
  }

  return timingSafeEqual(stored, computed);
}

export function hasAdminAccess(roles: AdminRole[]): boolean {
  return roles.includes('super_admin') || roles.includes('editor');
}

const adminUserSchema = new Schema<AdminUser, AdminUserModelType, AdminUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 80,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      sparse: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    roles: {
      type: [String],
      enum: ['super_admin', 'editor', 'author'],
      default: ['super_admin'],
    },
    status: {
      type: String,
      enum: ['active', 'disabled', 'invited'],
      default: 'active',
      index: true,
    },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  {
    collection: 'admin_users',
    timestamps: true,
  }
);

applyBaseSchema(adminUserSchema);

adminUserSchema.pre('validate', function normalizeAdminUser() {
  this.username = this.username.trim().toLowerCase();
  if (this.email) {
    this.email = normalizeEmail(this.email);
  }
  if (!this.displayName) {
    this.displayName = this.username;
  }
});

adminUserSchema.methods.setPassword = function setPassword(password: string): void {
  this.passwordHash = hashAdminPassword(password);
  this.passwordChangedAt = new Date();
};

adminUserSchema.methods.verifyPassword = function verifyPassword(password: string): boolean {
  return verifyAdminPasswordHash(password, this.passwordHash);
};

const existingAdminUserModel = models.AdminUser as AdminUserModelType | undefined;

export const AdminUserModel =
  existingAdminUserModel ??
  model<AdminUser, AdminUserModelType>('AdminUser', adminUserSchema);
