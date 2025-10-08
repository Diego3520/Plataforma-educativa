import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  PG_USER,
  PG_HOST,
  PG_DATABASE,
  PG_PASSWORD,
  PG_PORT,
  DATABASE_URL,
} = process.env;

function ensureDefined(name: string, value: string | undefined) {
  if (!value || value.length === 0) {
    throw new Error(`Variable de entorno faltante: ${name}`);
  }
  return value;
}

let pool: Pool;

if (DATABASE_URL && DATABASE_URL.length > 0) {
  pool = new Pool({
    connectionString: DATABASE_URL,
  });
} else {
  const user = ensureDefined('PG_USER', PG_USER);
  const host = ensureDefined('PG_HOST', PG_HOST);
  const database = ensureDefined('PG_DATABASE', PG_DATABASE);
  const password = ensureDefined('PG_PASSWORD', PG_PASSWORD);
  const port = parseInt(PG_PORT || '5432');

  pool = new Pool({
    user,
    host,
    database,
    password: String(password),
    port,
  });
}

export default pool;
