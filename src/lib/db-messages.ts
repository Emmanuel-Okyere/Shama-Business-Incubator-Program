import type { DatabaseState } from "@/lib/db";

/**
 * Turns a database state into something a person can act on.
 *
 * Every one of these used to render the same "set DATABASE_URL" screen, which
 * sends whoever is reading it to check the one thing that is usually already
 * correct. Each failure now names itself.
 */
export function explainDatabase(state: DatabaseState): {
  title: string;
  body: string;
  fix?: string;
} {
  switch (state.status) {
    case "unconfigured":
      return {
        title: "The application portal is not connected yet",
        body: "No database is configured for this deployment, so applications cannot be saved.",
        fix: "Set DATABASE_URL in the environment and redeploy. On Vercel, environment variables only reach a deployment built after they were added — adding the variable to an existing deployment is not enough. Check too that it is set for the environment you are viewing (Production, Preview or Development).",
      };
    case "unseeded":
      return {
        title: "No cohort is open yet",
        body: "The database is connected, but no cohort has been created, so there is nothing to apply to.",
        fix: "Run `npm run db:seed` against this database to create the cohort, its scoring criteria and the administrator account. If you have already seeded, check that DATABASE_URL points at the same database you seeded.",
      };
    case "unreachable":
      return {
        title: "The application portal is temporarily unavailable",
        body: "The programme database could not be reached, so your application cannot be opened right now. Nothing you have already saved has been lost.",
        fix: `Deployment detail: ${state.error}`,
      };
    case "ready":
      return {
        title: "The application portal is unavailable",
        body: "Something went wrong opening your application. Please try again shortly.",
      };
  }
}
