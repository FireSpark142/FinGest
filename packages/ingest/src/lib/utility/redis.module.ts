import Redis from 'ioredis';

export const redisServer: Redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
});

export const redisStream: Redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
});
