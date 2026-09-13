function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function fromParts() {
  const host = clean(process.env.PGHOST) || clean(process.env.POSTGRES_HOST);
  const user = clean(process.env.PGUSER) || clean(process.env.POSTGRES_USER);
  const password = clean(process.env.PGPASSWORD) || clean(process.env.POSTGRES_PASSWORD);
  const database = clean(process.env.PGDATABASE) || clean(process.env.POSTGRES_DATABASE);
  const port = clean(process.env.PGPORT) || clean(process.env.POSTGRES_PORT) || "5432";
  if (!host || !user || !database) return "";
  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);
  return `postgresql://${auth}@${host}:${port}/${database}?sslmode=require`;
}

export function resolveDatabaseUrl() {
  const candidates = [
    clean(process.env.DATABASE_URL),
    clean(process.env.POSTGRES_PRISMA_URL),
    clean(process.env.POSTGRES_URL),
    clean(process.env.POSTGRES_URL_NON_POOLING),
    clean(process.env.DATABASE_URL_UNPOOLED),
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
  return clean(process.env.AUTH_SECRET);
}

export function allowedEmails() {
  return new Set(
    clean(process.env.ALLOWED_EMAILS)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function emailAllowed(email: string) {
  return allowedEmails().has(email.trim().toLowerCase());
}

export function allowlistConfigured() {
  return allowedEmails().size > 0;
}
