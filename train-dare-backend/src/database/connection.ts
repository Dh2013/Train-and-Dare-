import mongoose from 'mongoose';
import { getEnv } from '../config/env';

const env = getEnv();

let connectionPromise: Promise<boolean> | null = null;
let shutdownRegistered = false;

mongoose.set('strictQuery', true);

function registerShutdownHooks(): void {
  if (shutdownRegistered) {
    return;
  }

  shutdownRegistered = true;

  const closeConnection = async (signal: string): Promise<void> => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } finally {
      if (signal === 'SIGINT' || signal === 'SIGTERM') {
        process.exit(0);
      }
    }
  };

  process.once('SIGINT', () => {
    void closeConnection('SIGINT');
  });
  process.once('SIGTERM', () => {
    void closeConnection('SIGTERM');
  });
}

export function isDatabaseConfigured(): boolean {
  return Boolean(env.mongoUri);
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): {
  provider: 'mongodb';
  configured: boolean;
  connected: boolean;
  databaseName: string;
  host?: string;
} {
  return {
    provider: 'mongodb',
    configured: isDatabaseConfigured(),
    connected: isDatabaseReady(),
    databaseName: mongoose.connection.name || env.mongoDbName,
    host: mongoose.connection.host || undefined,
  };
}

export async function connectToDatabase(): Promise<boolean> {
  if (!env.mongoUri) {
    return false;
  }

  if (isDatabaseReady()) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(env.mongoUri, {
      dbName: env.mongoDbName,
      autoIndex: env.mongoAutoIndex,
      maxPoolSize: env.isProduction ? 20 : 10,
      minPoolSize: env.isProduction ? 2 : 0,
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
      socketTimeoutMS: env.mongoSocketTimeoutMs,
    })
    .then(() => {
      registerShutdownHooks();
      console.log(`[mongodb] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
      return true;
    })
    .catch((error: unknown) => {
      connectionPromise = null;
      console.error('[mongodb] connection failed', error);

      if (env.mongoRequired) {
        throw error;
      }

      return false;
    });

  return connectionPromise;
}

export async function disconnectFromDatabase(): Promise<void> {
  connectionPromise = null;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
