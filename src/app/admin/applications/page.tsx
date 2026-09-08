import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import type { ApplicationStatus, ClusterKey, Prisma } from "@prisma/client";
import { prisma, safeQuery } from "@/lib/db";
import { CLUSTERS, ghs } from "@/lib/programme";
import { STATUS_CLASSES, STATUS_META } from "@/lib/status";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

const CLUSTER_KEYS: ClusterKey[] = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
];

const STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "NOT_SELECTED",
  "DRAFT",
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cluster?: string; q?: string; gender?: string }>;
}) {
  const params = await searchParams;

  const where: Prisma.ApplicationWhereInput = {};
  if (params.status && STATUSES.includes(params.status as ApplicationStatus)) {
    where.status = params.status as ApplicationStatus;
  }
  if (params.cluster && CLUSTER_KEYS.includes(params.cluster as ClusterKey)) {
    where.cluster = params.cluster as ClusterKey;
  }
  if (params.gender) where.gender = params.gender;
  if (params.q) {
    where.OR = [
      { reference: { contains: params.q, mode: "insensitive" } },
      { businessName: { contains: params.q, mode: "insensitive" } },
      { community: { contains: params.q, mode: "insensitive" } },
      { user: { fullName: { contains: params.q, mode: "insensitive" } } },
      { user: { email: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  const applications = await safeQuery(
    () =>
      prisma.application.findMany({
        where,
        include: { user: true, reviews: true, _count: { select: { documents: true } } },
        orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
        take: 200,
      }),
    [],
  );

  const exportHref = `/api/admin/applications/export?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString()}`;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
            Applicant database
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">Applications</h1>
          <p className="mt-2 text-ink-500">
            {applications.length} record{applications.length === 1 ? "" : "s"} shown
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-5 py-2.5 text-[0.85rem] font-medium text-ink-900 transition-colors hover:border-lime-500 hover:bg-lime-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </header>

      {/* ------------------------------------------------------- filters */}
      <form className="mb-6 rounded-3xl border border-ink-900/8 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Name, business, reference…"
              className="w-full rounded-xl border border-ink-900/12 py-2.5 pr-4 pl-11 text-[0.9rem] focus:border-lime-500 focus:ring-4 focus:ring-lime-500/12 focus:outline-none"
            />
          </div>

          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-xl border border-ink-900/12 px-4 py-2.5 text-[0.9rem] focus:border-lime-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>

          <select
            name="cluster"
            defaultValue={params.cluster ?? ""}
            className="rounded-xl border border-ink-900/12 px-4 py-2.5 text-[0.9rem] focus:border-lime-500 focus:outline-none"
          >
            <option value="">All clusters</option>
            {CLUSTERS.map((c, i) => (
              <option key={c.slug} value={CLUSTER_KEYS[i]}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              name="gender"
              defaultValue={params.gender ?? ""}
              className="flex-1 rounded-xl border border-ink-900/12 px-4 py-2.5 text-[0.9rem] focus:border-lime-500 focus:outline-none"
            >
              <option value="">Any gender</option>
              {["Female", "Male", "Prefer not to say"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink-950 px-4 text-[0.85rem] font-medium text-white transition-colors hover:bg-ink-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </form>

      {/* --------------------------------------------------------- table */}
      <div className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-[0.88rem]">
            <thead className="border-b border-ink-900/8 bg-lime-50/60">
              <tr className="text-[0.72rem] font-semibold tracking-wide text-ink-500 uppercase">
                <th className="px-5 py-3.5">Applicant</th>
                <th className="px-5 py-3.5">Business</th>
                <th className="px-5 py-3.5">Cluster</th>
                <th className="px-5 py-3.5">Funding</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/6">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-ink-500">
                    No applications match these filters.
                  </td>
                </tr>
              ) : (
                applications.map((application) => {
                  const scores = application.reviews.filter((r) => r.submittedAt);
                  const average =
                    scores.length > 0
                      ? scores.reduce((sum, r) => sum + r.total, 0) / scores.length
                      : null;
                  const clusterIndex = application.cluster
                    ? CLUSTER_KEYS.indexOf(application.cluster)
                    : -1;
                  const cluster = clusterIndex >= 0 ? CLUSTERS[clusterIndex] : null;

                  return (
                    <tr key={application.id} className="transition-colors hover:bg-lime-50/50">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="font-medium text-ink-900 hover:text-lime-700 hover:underline"
                        >
                          {application.user.fullName}
                        </Link>
                        <p className="text-[0.75rem] text-ink-500">{application.reference}</p>
                      </td>
                      <td className="max-w-[14rem] truncate px-5 py-3.5 text-ink-500">
                        {application.businessName ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {cluster ? (
                          <span
                            className="rounded-full px-2.5 py-1 text-[0.72rem] font-medium text-white"
                            style={{ backgroundColor: cluster.accent }}
                          >
                            {cluster.short}
                          </span>
                        ) : (
                          <span className="text-ink-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500">
                        {application.fundingRequired ? ghs(application.fundingRequired) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {average !== null ? (
                          <span className="font-display font-bold text-ink-900">
                            {average.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-ink-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500">
                        {application.submittedAt ? formatDate(application.submittedAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 text-[0.72rem] font-semibold whitespace-nowrap",
                            STATUS_CLASSES[application.status],
                          )}
                        >
                          {STATUS_META[application.status].label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
