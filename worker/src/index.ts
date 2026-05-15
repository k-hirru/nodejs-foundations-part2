import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const REDIS_URL: string = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

redis.on('connect', (): void => {
  console.log('Worker started — connected to Redis');
});

redis.on('error', (err: Error): void => {
  console.error('Redis error:', err.message);
});

process.on('SIGTERM', (): void => {
  redis.disconnect();
  process.exit(0);
});
