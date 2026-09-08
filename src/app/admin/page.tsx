import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  FileCheck2,
  Inbox,
  MessageSquare,
  TriangleAlert,
  Users,
} from "lucide-react";
import { prisma, dbConfigured, safeQuery } from "@/lib/db";
import { getSettings, num } from "@/lib/settings";
import { smsConfigured } from "@/lib/sms";
import { storageConfigured } from "@/lib/storage";
import { CLUSTERS, ghs } from "@/lib/programme";
import { STATUS_CLASSES, STATUS_META } from "@/lib/status";
import { formatDateTime, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

const CLUSTER_KEYS = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
] as const;

export default async function AdminOverview() {
  const settings = await getSettings();

  const [byStatus, byCluster, totals, recent, enquiries, leads, smsLog] = await Promise.all([
    safeQuery(() => prisma.application.groupBy({ by: ["status"], _count: true }), []),
    safeQuery(
      () =>
        prisma.application.groupBy({
          by: ["cluster"],
          _count: true,
          where: { status: { not: "DRAFT" } },
        }),
      [],
    ),
    safeQuery(
      async () => ({
        applications: await prisma.application.count({ where: { status: { not: "DRAFT" } } }),
        drafts: await prisma.application.count({ where: { status: "DRAFT" } }),
        users: await prisma.user.count(),
        selected: await prisma.application.count({ where: { status: "SELECTED" } }),
      }),
      { applications: 0, drafts: 0, users: 0, selected: 0 },
    ),
    safeQuery(
      () =>
        prisma.application.findMany({
          where: { status: { not: "DRAFT" } },
          include: { user: true },
          orderBy: { submittedAt: "desc" },
          take: 6,
        }),
      [],
    ),
    safeQuery(() => prisma.enquiry.count({ where: { status: "NEW" } }), 0),
    safeQuery(() => prisma.partnerLead.count(), 0),
    safeQuery(
      async () => ({
        sent: await prisma.notification.count({ where: { channel: "SMS", status: "SENT" } }),
        failed: await prisma.notification.count({ where: { channel: "SMS", status: "FAILED" } }),
      }),
      { sent: 0, failed: 0 },
    ),
  ]);

  const statusCount = (status: string) =>
    byStatus.find((row) => row.status === status)?._count ?? 0;

  const warnings = [
    !dbConfigured() && {
      title: "Database not connected",
      body: "Set DATABASE_URL, then run `npm run db:push` and `npm run db:seed`.",
    },
    !smsConfigured() && {
      title: "GiantSMS not configured",
      body: "Add GIANTSMS_API_TOKEN (or GIANTSMS_USERNAME and GIANTSMS_PASSWORD) to send programme SMS.",
    },
    !storageConfigured() && {
      title: "Document storage not configured",
      body: "Add Vercel Blob to the project so applicants can upload documents in production.",
    },
  ].filter(Boolean) as { title: string; body: string }[];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Programme dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Overview</h1>
      </header>

      {warnings.length > 0 && (
        <div className="mb-8 space-y-3">
          {warnings.map((warning) => (
            <div
              key={warning.title}
              className="flex gap-4 rounded-2xl border border-cream-200 bg-cream-50 p-5"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-display font-bold text-ink-900">{warning.title}</p>
                <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-500">{warning.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="Applications received"
          value={totals.applications}
          sub={`${totals.drafts} still in draft`}
        />
        <Stat
          icon={FileCheck2}
          label="Shortlisted"
          value={statusCount("SHORTLISTED")}
          sub={`${statusCount("UNDER_REVIEW")} under review`}
        />
        <Stat
          icon={Coins}
          label="Selected"
          value={totals.selected}
          sub={`of ${num(settings, "stat_entrepreneurs")} seats`}
        />
        <Stat
          icon={MessageSquare}
          label="SMS delivered"
          value={smsLog.sent}
          sub={smsLog.failed > 0 ? `${smsLog.failed} failed` : "no failures"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg text-ink-900">Recent submissions</h2>
            <Link
              href="/admin/applications"
              className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-lime-700 hover:underline"
            >
              All applications
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 text-[0.9rem] text-ink-500">No applications submitted yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-ink-900/6">
              {recent.map((application) => (
                <li key={application.id}>
                  <Link
                    href={`/admin/applications/${application.id}`}
                    className="flex items-center gap-4 py-3.5 transition-colors hover:bg-lime-50/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink-900">
                        {application.businessName ?? application.user.fullName}
                      </p>
                      <p className="truncate text-[0.8rem] text-ink-500">
                        {application.reference} · {application.user.fullName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[0.72rem] font-semibold",
                        STATUS_CLASSES[application.status],
                      )}
                    >
                      {STATUS_META[application.status].label}
                    </span>
                    <span className="hidden shrink-0 text-[0.75rem] text-ink-500 sm:block">
                      {application.submittedAt ? formatDateTime(application.submittedAt) : "—"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
            <h2 className="font-display text-lg text-ink-900">Applications by cluster</h2>
            <ul className="mt-6 space-y-4">
              {CLUSTERS.map((cluster, i) => {
                const count =
                  byCluster.find((row) => row.cluster === CLUSTER_KEYS[i])?._count ?? 0;
                const pct = Math.min(100, (count / cluster.seats) * 100);
                return (
                  <li key={cluster.slug}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.85rem] font-medium text-ink-900">
                        {cluster.name}
                      </span>
                      <span className="text-[0.8rem] text-ink-500">
                        {count} / {cluster.seats}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-900/8">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cluster.accent }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
            <h2 className="font-display text-lg text-ink-900">Needs attention</h2>
            <ul className="mt-5 space-y-3">
              <AttentionRow
                href="/admin/enquiries"
                icon={Inbox}
                label="New enquiries"
                value={enquiries}
              />
              <AttentionRow
                href="/admin/partners"
                icon={Coins}
                label="Partner leads in pipeline"
                value={leads}
              />
              <AttentionRow
                href="/admin/applications?status=SUBMITTED"
                icon={FileCheck2}
                label="Awaiting first review"
                value={statusCount("SUBMITTED")}
              />
            </ul>
          </section>

          <section className="rounded-3xl bg-ink-950 p-7 text-white">
            <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-lime-300 uppercase">
              Grant pool
            </p>
            <p className="mt-2 font-display text-3xl font-bold">
              {ghs(num(settings, "stat_funding"))}
            </p>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-white/55">
              Across {num(settings, "stat_funded")} businesses, allocated at the Ultimate Pitch.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-ink-900/8 bg-white p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-100 text-lime-700">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-5 text-[0.75rem] font-medium text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-ink-900">
        {value.toLocaleString("en-GB")}
      </p>
      <p className="mt-1 text-[0.75rem] text-ink-500/70">{sub}</p>
    </div>
  );
}

function AttentionRow({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-lime-50"
      >
        <Icon className="h-4 w-4 shrink-0 text-lime-700" />
        <span className="flex-1 text-[0.85rem] text-ink-500">{label}</span>
        <span className="font-display text-sm font-bold text-ink-900">{value}</span>
      </Link>
    </li>
  );
}
