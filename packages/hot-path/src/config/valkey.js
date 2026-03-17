import Redis from 'ioredis'

export const valkey = new Redis({
  host: 'localhost',
  port: 6379
});
