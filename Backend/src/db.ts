import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
    PGUSER,
    PGHOST,
    PGDATABASE,
    PGPASSWORD,
    PGPORT,
    DATABASE_URL,
} = process.env;

function ensureDefined(name: string, value: string | undefined) {
    if (!value || value.length === 0) {
        throw new Error(`Variable de entorno faltante: ${name}`);
    }
    return value;
}

let pool: Pool;

const sslConfig = { rejectUnauthorized: false };

if (DATABASE_URL && DATABASE_URL.length > 0) {
    pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: sslConfig,
    });
} else {
    const user = ensureDefined('PGUSER', PGUSER);
    const host = ensureDefined('PGHOST', PGHOST);
    const database = ensureDefined('PGDATABASE', PGDATABASE);
    const password = ensureDefined('PGPASSWORD', PGPASSWORD);
    const port = parseInt(PGPORT || '5432');

    pool = new Pool({
        user,
        host,
        database,
        password: String(password),
        port,
        ssl: sslConfig,
    });
}

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de PostgreSQL', err);
    process.exit(-1);
});

export default pool;