import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { getSession, isAdmin } from "@/lib/auth";
import { describeDatabase, prisma, safeQuery, type DatabaseState } from "@/lib/db";
import { explainDatabase } from "@/lib/db-messages";
import { STATUS_CLASSES, STATUS_FLOW, STATUS_META } from "@/lib/status";
import { CLUSTERS, PROGRAMME, ghs } from "@/lib/programme";
import { formatDate, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

const CLUSTER_KEYS = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
] as const;

export default async function PortalPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=%2Fportal");

  const database = await describeDatabase();

  const application = await safeQuery(
    () =>
      prisma.application.findFirst({
        where: { userId: user.id },
        include: { documents: true, cohort: true },
        orderBy: { createdAt: "desc" },
      }),
    null,
  );

  const notifications = await safeQuery(
    () =>
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    [],
  );

  const events = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
      }),
    [],
  );

  const cluster = application?.cluster
    ? CLUSTERS[CLUSTER_KEYS.indexOf(application.cluster)]
    : null;

  const status = application?.status ?? "DRAFT";
  const meta = STATUS_META[status];
  const flowIndex = STATUS_FLOW.indexOf(status);

  return (
    <Container>
      <div className="mb-10">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          {PROGRAMME.cohort}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
      </div>

      {database.status !== "ready" ? (
        <DatabasePanel state={database} />
      ) : !application ? (
        <Panel>
          <h2 className="font-display text-2xl text-ink-900">You have not started an application</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-ink-500">
            {PROGRAMME.cohort} has 100 seats across four clusters, an 8-week bootcamp, one-on-one
            mentorship and {ghs(480000)} in grant funding. It is free to apply.
          </p>
          <Button href="/apply/start" size="lg" className="mt-8">
            Start your application
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {/* --------------------------------------------- status card */}
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-ink-500 uppercase">
                    Application reference
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">
                    {application.reference}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.8rem] font-semibold",
                    STATUS_CLASSES[status],
                  )}
                >
                  {meta.label}
                </span>
              </div>

              <p className="mt-5 leading-relaxed text-ink-500">{meta.blurb}</p>

              {status === "DRAFT" ? (
                <Button href="/apply/start" className="mt-7">
                  Continue your application
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <ol className="mt-8 space-y-1">
                  {STATUS_FLOW.slice(1).map((stage, i) => {
                    const index = i + 1;
                    const reached = flowIndex >= index;
                    const current = flowIndex === index;
                    const rejected = status === "NOT_SELECTED";
                    return (
                      <li key={stage} className="flex items-center gap-4">
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold transition-colors",
                            reached && !rejected
                              ? "bg-lime-500 text-ink-950"
                              : "bg-ink-900/8 text-ink-500",
                          )}
                        >
                          {reached && !rejected ? <Check className="h-4 w-4" /> : index}
                        </span>
                        <span
                          className={cn(
                            "text-[0.92rem]",
                            current ? "font-semibold text-ink-900" : "text-ink-500",
                          )}
                        >
                          {STATUS_META[stage].label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Panel>

            {/* ------------------------------------------- summary card */}
            <Panel>
              <h2 className="font-display text-xl text-ink-900">Your submission</h2>
              <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ["Business", application.businessName ?? "—"],
                  ["Cluster", cluster?.name ?? "—"],
                  ["Location", application.businessLocation ?? "—"],
                  [
                    "Funding requested",
                    application.fundingRequired ? ghs(application.fundingRequired) : "—",
                  ],
                  [
                    "Submitted",
                    application.submittedAt ? formatDateTime(application.submittedAt) : "Not yet",
                  ],
                  ["Documents", `${application.documents.length} uploaded`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[0.72rem] font-semibold tracking-wide text-ink-500 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[0.95rem] text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>

              {application.documents.length > 0 && (
                <ul className="mt-7 space-y-2 border-t border-ink-900/8 pt-6">
                  {application.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-lime-700" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[0.88rem] text-ink-900 hover:underline"
                      >
                        {doc.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* ------------------------------------------------- sidebar */}
          <div className="space-y-6">
            <Panel>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-lime-600" />
                <h2 className="font-display text-lg text-ink-900">Recent messages</h2>
              </div>
              {notifications.length === 0 ? (
                <p className="mt-5 text-[0.9rem] leading-relaxed text-ink-500">
                  Programme SMS updates will appear here.
                </p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {notifications.map((n) => (
                    <li key={n.id} className="border-l-2 border-lime-400 pl-4">
                      <p className="text-[0.88rem] leading-relaxed text-ink-900">{n.body}</p>
                      <p className="mt-1.5 text-[0.72rem] text-ink-500">
                        {formatDateTime(n.createdAt)} · {n.status.toLowerCase()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {events.length > 0 && (
              <Panel>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-lime-600" />
                  <h2 className="font-display text-lg text-ink-900">Upcoming</h2>
                </div>
                <ul className="mt-5 space-y-4">
                  {events.map((event) => (
                    <li key={event.id}>
                      <p className="font-display text-[0.92rem] font-bold text-ink-900">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-[0.8rem] text-ink-500">
                        {formatDate(event.startsAt)} · {event.location}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <div className="rounded-3xl bg-ink-950 p-7 text-white">
              <Sparkles className="h-5 w-5 text-lime-400" />
              <h2 className="mt-4 font-display text-lg">What happens next</h2>
              <p className="mt-2.5 text-[0.88rem] leading-relaxed text-white/55">
                Every status change is sent to your phone by SMS. You do not need to call the
                programme office to check.
              </p>
              <Link
                href="/programme-journey"
                className="mt-5 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-lime-300 hover:underline"
              >
                See the full journey
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isAdmin(user) && (
              <Link
                href="/admin"
                className="block rounded-3xl border border-dashed border-ink-900/20 p-6 text-center text-[0.88rem] font-medium text-ink-500 transition-colors hover:border-lime-500 hover:text-lime-700"
              >
                Open the admin dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}

function DatabasePanel({ state }: { state: DatabaseState }) {
  const { title, body, fix } = explainDatabase(state);
  return (
    <Panel>
      <h2 className="font-display text-xl text-ink-900">{title}</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-500">{body}</p>
      {fix && (
        <p className="mt-5 rounded-2xl bg-lime-50 px-5 py-4 text-[0.85rem] leading-relaxed text-lime-900">
          {fix}
        </p>
      )}
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink-900/8 bg-white p-7 sm:p-8">{children}</section>
  );
}
