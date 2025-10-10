import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  pGUSER,
  pGHOST,
  pGDATABASE,
  pGPASSWORD,
  pGPORT,
  dATABASEURL,
} = process.env;

function ensureDefined(name: string, value: string | undefined) {
  if (!value || value.length === 0) {
    throw new Error(`Variable de entorno faltante: ${name}`);
  }
  return value;
}

let pool: Pool;

if (dATABASEURL && dATABASEURL.length > 0) {
  pool = new Pool({
    connectionString: dATABASEURL,
  });
} else {
  const user = ensureDefined('PG_USER', pGUSER);
  const host = ensureDefined('PG_HOST', pGHOST);
  const database = ensureDefined('PG_DATABASE', pGDATABASE);
  const password = ensureDefined('PG_PASSWORD', pGPASSWORD);
  const port = parseInt(pGPORT || '5432');

  pool = new Pool({
    user,
    host,
    database,
    password: String(password),
    port,
  });
}

export default pool;