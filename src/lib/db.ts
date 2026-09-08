import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Whether a database is configured, read at call time.
 *
 * This must not be a module-level constant. These modules are also evaluated
 * while the static pages are prerendered, so a constant can capture whatever
 * the *build* environment had and keep serving that answer at runtime — which
 * looks exactly like "I set DATABASE_URL and the app still says it is not set".
 */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Public pages must render even before a database is attached, so that the
 * marketing site can be deployed to Vercel first and the portal switched on
 * when DATABASE_URL is set. Reads that are decoration rather than truth go
 * through this helper and fall back to a supplied default.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!dbConfigured()) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error("[db] query failed, using fallback:", (error as Error).message);
    return fallback;
  }
}

export type DatabaseState =
  /** No DATABASE_URL in the environment. */
  | { status: "unconfigured" }
  /** Configured, but the query did not get through. */
  | { status: "unreachable"; error: string }
  /** Reachable, but nothing has been seeded, so there is no cohort to apply to. */
  | { status: "unseeded" }
  | { status: "ready" };

/**
 * Distinguishes the ways the portal can be unavailable, so the screen a user
 * lands on names the actual problem instead of blaming the one cause that is
 * easiest to guess.
 */
export async function describeDatabase(): Promise<DatabaseState> {
  if (!dbConfigured()) return { status: "unconfigured" };

  try {
    const cohorts = await prisma.cohort.count();
    return cohorts > 0 ? { status: "ready" } : { status: "unseeded" };
  } catch (error) {
    // The full error, code frame and all, goes to the deployment log.
    console.error("[db] not reachable:", error);
    return { status: "unreachable", error: concise((error as Error).message) };
  }
}

/**
 * Prisma errors arrive as a paragraph of code frame and absolute file paths.
 * That belongs in the log, not on a page an applicant is looking at, so keep
 * only the first sentence that reads like an explanation.
 */
export function concise(message: string, limit = 180): string {
  const explanation = message
    .split("\n")
    .map((line) => line.trim())
    // Drop code-frame gutters ("57", "→ 59 const x ="), anything carrying a
    // file path, and Prisma's "Invalid `prisma.x()` invocation in" preamble.
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("→") &&
        !/^\d+(\s|$)/.test(line) &&
        !line.includes("/") &&
        !line.startsWith("Invalid `"),
    )
    // An explanation is a sentence, not a stray token.
    .find((line) => line.split(/\s+/).length >= 3);

  const text = (explanation ?? "The database could not be reached.").replace(/\s+/g, " ");
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}
