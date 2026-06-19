import fs from 'fs';
import path from 'path';

export interface AppEnv {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  jwtSecret: string;
  jwtExpiresSec: number;
  adminUsername: string;
  adminPassword: string;
  mongoUri?: string;
  mongoDbName: string;
  mongoAutoIndex: boolean;
  mongoRequired: boolean;
  mongoServerSelectionTimeoutMs: number;
  mongoSocketTimeoutMs: number;
}

let loadedDotEnv = false;

function loadDotEnvFile(): void {
  if (loadedDotEnv) {
    return;
  }

  loadedDotEnv = true;
  const envFile = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envFile)) {
    return;
  }

  const raw = fs.readFileSync(envFile, 'utf8');
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.replace(/\\n/g, '\n');
  }
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

loadDotEnvFile();

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';

const env: AppEnv = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parseNumber(process.env.PORT, 3001),
  jwtSecret: process.env.JWT_SECRET?.trim() || 'train-dare-secret-change-in-production',
  jwtExpiresSec: parseNumber(process.env.JWT_EXPIRES_IN, 7 * 24 * 60 * 60),
  adminUsername: process.env.ADMIN_USERNAME?.trim().toLowerCase() || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin',
  mongoUri: parseOptionalString(process.env.MONGODB_URI),
  mongoDbName: process.env.MONGODB_DB_NAME?.trim() || 'train_dare_academy',
  mongoAutoIndex: parseBoolean(process.env.MONGODB_AUTO_INDEX, nodeEnv !== 'production'),
  mongoRequired: parseBoolean(process.env.MONGODB_REQUIRED, false),
  mongoServerSelectionTimeoutMs: parseNumber(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 5000),
  mongoSocketTimeoutMs: parseNumber(process.env.MONGODB_SOCKET_TIMEOUT_MS, 20000),
});

export function getEnv(): AppEnv {
  return env;
}

export function getSecurityWarnings(): string[] {
  const warnings: string[] = [];

  if (env.jwtSecret === 'train-dare-secret-change-in-production') {
    warnings.push('JWT_SECRET is using the default value. Replace it before production.');
  }

  if (env.adminUsername === 'admin' && env.adminPassword === 'admin') {
    warnings.push('ADMIN_USERNAME and ADMIN_PASSWORD are still using the default credentials.');
  }

  if (!env.mongoUri) {
    warnings.push('MONGODB_URI is not set. MongoDB mode will stay disabled until it is configured.');
  }

  return warnings;
}

