// src/utils/cache.js
import redis from 'redis';

export const initializeRedis = async () => {
  const client = redis.createClient({
    url: 'redis://localhost:6379',
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  console.log('Redis connected');
  return client;
};