import { Pool, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function firstDefinedEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function resolveConnectionString() {
  // Prefer the transaction pooler (port 6543). POSTGRES_URL_NON_POOLING is the
  // session-mode pooler on :5432, which caps at 15 clients and fails on Vercel
  // when several research-capability routes open at once.
  const raw = firstDefinedEnv(
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
  );
  if (!raw) {
    throw new Error("POSTGRES_URL or POSTGRES_URL_NON_POOLING is not set");
  }

  const url = new URL(raw);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("supa");
  url.searchParams.delete("pgbouncer");
  return url.toString();
}

function postgresConfig() {
  const serverless = Boolean(process.env.VERCEL);
  return {
    connectionString: resolveConnectionString(),
    max: serverless ? 1 : 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
    ssl: { rejectUnauthorized: false },
  };
}

export function getResearchCapabilityPool(): Pool {
  if (pool) return pool;
  pool = new Pool(postgresConfig());
  return pool;
}

export async function queryResearchCapability<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await getResearchCapabilityPool().query<T>({
    text,
    values,
  });
  return result.rows;
}
