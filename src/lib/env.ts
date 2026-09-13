export function readEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function fromParts() {
  const host = readEnv("PGHOST") || readEnv("POSTGRES_HOST");
  const user = readEnv("PGUSER") || readEnv("POSTGRES_USER");
  const password = readEnv("PGPASSWORD") || readEnv("POSTGRES_PASSWORD");
  const database = readEnv("PGDATABASE") || readEnv("POSTGRES_DATABASE");
  const port = readEnv("PGPORT") || readEnv("POSTGRES_PORT") || "5432";
  if (!host || !user || !database) return "";
  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);
  return `postgresql://${auth}@${host}:${port}/${database}?sslmode=require`;
}

export function resolveDatabaseUrl() {
  const candidates = [
    readEnv("DATABASE_URL"),
    readEnv("POSTGRES_PRISMA_URL"),
    readEnv("POSTGRES_URL"),
    readEnv("POSTGRES_URL_NON_POOLING"),
    readEnv("DATABASE_URL_UNPOOLED"),
    fromParts(),
  ].filter(Boolean);

  return (
    candidates.find((url) => url.startsWith("postgres://") || url.startsWith("postgresql://")) ||
    ""
  );
}

export function databaseConfigured() {
  const url = resolveDatabaseUrl();
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function authSecret() {
  return readEnv("AUTH_SECRET");
}
