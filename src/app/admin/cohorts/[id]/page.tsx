import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  CohortFields,
  DeleteCriterion,
  NewCriterion,
  NewQuestion,
  QuestionControls,
  type CohortRow,
} from "@/components/admin/CohortForms";
import { prisma, safeQuery } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Configure cohort",
  robots: { index: false, follow: false },
};

const TYPE_LABELS: Record<string, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  select: "Dropdown",
  radio: "Multiple choice",
  checkbox: "Checkboxes",
  yes_no: "Yes / No",
  number: "Number",
  file: "File upload",
};

export default async function CohortDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cohort = await safeQuery(
    () =>
      prisma.cohort.findUnique({
        where: { id },
        include: {
          criteria: { orderBy: { order: "asc" } },
          questions: { orderBy: { order: "asc" } },
          _count: { select: { applications: true } },
        },
      }),
    null,
  );

  if (!cohort) notFound();

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

  const weightTotal = cohort.criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/cohorts"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-lime-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All cohorts
      </Link>

      <header className="mt-6 mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          {cohort.isActive ? "Live cohort" : "Cohort"} · {cohort.year}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">{cohort.name}</h1>
      </header>

      <div className="space-y-6">
        <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
          <h2 className="mb-6 font-display text-lg text-ink-900">Cohort details</h2>
          <CohortFields cohort={row} />
        </section>

        {/* --------------------------------------------------- criteria */}
        <NewCriterion cohortId={cohort.id} />

        <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink-900/8 px-7 py-5">
            <h2 className="font-display text-lg text-ink-900">
              Current criteria ({cohort.criteria.length})
            </h2>
            <span className="text-[0.8rem] text-ink-500">total weight {weightTotal}</span>
          </div>

          {cohort.criteria.length === 0 ? (
            <p className="px-7 py-10 text-center text-[0.9rem] text-ink-500">
              No criteria yet — reviewers cannot score applications until at least one exists.
            </p>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {cohort.criteria.map((criterion) => (
                <li key={criterion.id} className="flex items-start justify-between gap-6 px-7 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{criterion.name}</p>
                    {criterion.description && (
                      <p className="mt-0.5 text-[0.82rem] text-ink-500">{criterion.description}</p>
                    )}
                    <p className="mt-1.5 text-[0.75rem] text-ink-500/80">
                      weight ×{criterion.weight} · max {criterion.maxScore} ·{" "}
                      {Math.round((criterion.weight / Math.max(1, weightTotal)) * 100)}% of the
                      total score
                    </p>
                  </div>
                  <DeleteCriterion id={criterion.id} cohortId={cohort.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* -------------------------------------------------- questions */}
        <NewQuestion cohortId={cohort.id} />

        <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
          <div className="border-b border-ink-900/8 px-7 py-5">
            <h2 className="font-display text-lg text-ink-900">
              Extra questions ({cohort.questions.length})
            </h2>
          </div>

          {cohort.questions.length === 0 ? (
            <p className="px-7 py-10 text-center text-[0.9rem] text-ink-500">
              None yet. The standard application is asked either way.
            </p>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {cohort.questions.map((question) => (
                <li key={question.id} className="flex items-start justify-between gap-6 px-7 py-4">
                  <div className="min-w-0">
                    <p className={cn("font-medium", question.active ? "text-ink-900" : "text-ink-500 line-through")}>
                      {question.label}
                      {question.required && <span className="ml-1.5 text-brandred">*</span>}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-ink-500">
                      {question.section} · {TYPE_LABELS[question.type] ?? question.type}
                      {question.options.length > 0 && ` · ${question.options.length} options`}
                    </p>
                  </div>
                  <QuestionControls
                    id={question.id}
                    cohortId={cohort.id}
                    active={question.active}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
