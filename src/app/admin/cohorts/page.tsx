import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarRange, Users } from "lucide-react";
import {
  ActivateButton,
  DeleteCohort,
  NewCohort,
  type CohortRow,
} from "@/components/admin/CohortForms";
import { prisma, safeQuery } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cohorts",
  robots: { index: false, follow: false },
};

export default async function CohortsPage() {
  const cohorts = await safeQuery(
    () =>
      prisma.cohort.findMany({
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        include: {
          _count: { select: { applications: true, criteria: true, questions: true } },
        },
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Cohort management
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Cohorts</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          The platform is not tied to one cohort. Create the next one here — its dates, seats,
          scoring criteria and application questions are configured per cohort, and the live cohort
          is the one the public site and application portal use.
        </p>
      </header>

      <div className="mb-6">
        <NewCohort />
      </div>

      {cohorts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-ink-900/15 bg-white px-8 py-16 text-center text-ink-500">
          No cohorts yet. Create the first one above.
        </p>
      ) : (
        <ul className="space-y-4">
          {cohorts.map((cohort) => {
            const row: CohortRow = {
              id: cohort.id,
              name: cohort.name,
              slug: cohort.slug,
              year: cohort.year,
              seats: cohort.seats,
              isActive: cohort.isActive,
              applicationsOpen: cohort.applicationsOpen,
              opensAt: cohort.opensAt?.toISOString() ?? null,
              closesAt: cohort.closesAt?.toISOString() ?? null,
              bootcampStartsAt: cohort.bootcampStartsAt?.toISOString() ?? null,
              ultimatePitchAt: cohort.ultimatePitchAt?.toISOString() ?? null,
              applications: cohort._count.applications,
            };

            return (
              <li
                key={cohort.id}
                className={cn(
                  "rounded-3xl border bg-white p-7",
                  cohort.isActive ? "border-lime-500/50 shadow-lift" : "border-ink-900/8",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-xl text-ink-900">{cohort.name}</h2>
                      <ActivateButton cohortId={cohort.id} isActive={cohort.isActive} />
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[0.72rem] font-medium",
                          cohort.applicationsOpen
                            ? "bg-lime-100 text-lime-800"
                            : "bg-ink-900/6 text-ink-500",
                        )}
                      >
                        {cohort.applicationsOpen ? "Accepting applications" : "Applications closed"}
                      </span>
                    </div>

                    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[0.85rem] text-ink-500">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {cohort.seats} seats · {cohort._count.applications} application(s)
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-3.5 w-3.5" />
                        {cohort.opensAt ? formatDate(cohort.opensAt) : "—"} to{" "}
                        {cohort.closesAt ? formatDate(cohort.closesAt) : "—"}
                      </div>
                      <div>
                        {cohort._count.criteria} criteria · {cohort._count.questions} extra
                        question(s)
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Link
                      href={`/admin/cohorts/${cohort.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-4 py-2 text-[0.8rem] font-medium text-white transition-colors hover:bg-ink-700"
                    >
                      Configure
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {!cohort.isActive && (
                      <DeleteCohort cohortId={row.id} />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
