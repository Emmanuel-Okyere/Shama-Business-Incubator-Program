/**
 * Applies pending Prisma migrations during the build.
 *
 * Vercel does not run migrations for you — nothing does — so this runs as the
 * first half of `npm run build`. Every deployment therefore ships its schema
 * changes with the code that expects them, rather than relying on someone
 * remembering a manual step.
 *
 * If no database is configured the build continues without migrating. The
 * public site is designed to render on programme defaults with no database, so
 * it can be deployed and reviewed before Postgres is attached; failing the
 * build here would take that away.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/**
 * On Vercel the environment is already populated, but a local `npm run build`
 * gets its database URL from a dotenv file that Node itself does not read.
 * Values already in the environment always win.
 */
function loadDotenv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, key, rawValue = ""] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

// Next.js gives .env.local precedence over .env; mirror that ordering.
loadDotenv(".env.local");
loadDotenv(".env");

if (!process.env.DATABASE_URL) {
  console.warn(
    "\n[migrate] DATABASE_URL is not set — skipping migrations.\n" +
      "[migrate] The public site will build and render on programme defaults.\n" +
      "[migrate] Set DATABASE_URL and redeploy to bring the portal online.\n",
  );
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error(
    "\n[migrate] Migration failed — stopping the build rather than shipping " +
      "code against a schema that does not match it.\n",
  );
}

process.exit(result.status ?? 1);
