import { spawnSync } from "node:child_process";

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

const resolved =
  [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
    fromParts(),
  ].find((value) => typeof value === "string" && (value.startsWith("postgres://") || value.startsWith("postgresql://"))) ||
  "";

const flags = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL", "PGHOST", "AUTH_SECRET"];
console.log(
  "Env no build:",
  flags.map((key) => `${key}=${process.env[key] ? "sim" : "nao"}`).join(" "),
);

const hasPostgres = Boolean(resolved);
process.env.DATABASE_URL = resolved || "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

const steps = [["prisma", ["generate"]]];
if (hasPostgres) {
  steps.push(["prisma", ["db", "push", "--skip-generate"]]);
} else {
  console.warn(
    "Sem PostgreSQL no build. O deploy segue, mas o cadastro só grava depois de conectar um banco em Storage e fazer Redeploy.",
  );
}
steps.push(["next", ["build"]]);

for (const [cmd, args] of steps) {
  const result = spawnSync("npx", [cmd, ...args], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
