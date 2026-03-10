import dotenv from 'dotenv'
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    postres: {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '3306', 10),
        database: parseInt(process.env.PGDATABASE) || 'wtd_db',
        user: process.env.PGUSER || 'root',
        password: process.env.PGPASSWORD || 'root_password',
    },
};