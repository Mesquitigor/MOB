function fromParts() {
  const host = process.env.PGHOST || process.env.POSTGRES_HOST;
  const user = process.env.PGUSER || process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;
  const port = process.env.PGPORT || process.env.POSTGRES_PORT || "5432";
  if (!host || !user || !database) return "";
  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);
  return `postgresql://${auth}@${host}:${port}/${database}?sslmode=require`;
}

export function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
    fromParts(),
  ].filter((value): value is string => Boolean(value));

  return (
    candidates.find((url) => url.startsWith("postgres://") || url.startsWith("postgresql://")) ||
    ""
  );
}

export function databaseConfigured() {
  const url = resolveDatabaseUrl();
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}
