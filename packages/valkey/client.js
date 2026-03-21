    import Redis from "ioredis"

    export const createClient = () =>
        new Redis({
            host: process.env.VALKEY_HOST ?? "localhost",
            port: Number(process.env.VALKEY_PORT) ?? 6379
        });
