import Redis from "ioredis"

export const createClient = () => new Redis({
    host: process.env.VALKEY_HOST || "localhost",
    port: process.env.VALKEY_PORT ? Number(process.env.VALKEY_PORT) : 6379
});


export const valkey = createClient();
