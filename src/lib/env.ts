export function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
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
