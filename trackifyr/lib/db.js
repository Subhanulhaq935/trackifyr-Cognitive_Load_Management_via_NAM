import pg from 'pg';
const { Pool } = pg;

/** @returns {object | false | undefined} ssl option for pg; undefined = driver default (no TLS for typical local Postgres) */
function resolveSsl(connectionString) {
  const flag = process.env.DATABASE_SSL;
  if (flag === 'false' || flag === '0') return undefined;
  if (flag === 'true' || flag === '1') {
    return { rejectUnauthorized: false };
  }
  const u = connectionString.toLowerCase();
  if (
    u.includes('sslmode=require') ||
    u.includes('sslmode=verify-full') ||
    u.includes('neon.tech') ||
    u.includes('amazonaws.com') ||
    u.includes('supabase.co') ||
    u.includes('render.com')
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const getPool = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL in environment');
  }

  const ssl = resolveSsl(connectionString);
  const poolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  if (ssl !== undefined) {
    poolConfig.ssl = ssl;
  }

  // Next.js Dev Mode Cache: prevents creating 100s of pools during hot-reloads
  if (!globalThis.__trackifyrPgPool) {
    console.log("🚀 INITIALIZING NEW DATABASE POOL...");
    
    globalThis.__trackifyrPgPool = new Pool(poolConfig);

    // Error handling for the pool itself
    globalThis.__trackifyrPgPool.on('error', (err) => {
      console.error('❌ Unexpected error on idle database client', err);
      globalThis.__trackifyrPgPool = null; // Reset pool on fatal error
    });
  }

  return globalThis.__trackifyrPgPool;
};

export const query = (text, params) => getPool().query(text, params);
export const pool = { query: (...args) => getPool().query(...args) };