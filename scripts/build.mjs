import { spawnSync } from "node:child_process";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
  console.error(
    "Defina DATABASE_URL (PostgreSQL) ou conecte um banco em Storage na Vercel.",
  );
  process.exit(1);
}

process.env.DATABASE_URL = url;

const steps = [
  ["prisma", ["generate"]],
  ["prisma", ["db", "push", "--skip-generate"]],
  ["next", ["build"]],
];

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
