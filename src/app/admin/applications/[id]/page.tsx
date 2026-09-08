import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Mail, MapPin, Phone } from "lucide-react";
import { NotePanel, ScorePanel, StatusPanel } from "@/components/admin/ReviewPanels";
import { getSession } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/db";
import { CLUSTERS, ghs } from "@/lib/programme";
import { STATUS_CLASSES, STATUS_META } from "@/lib/status";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Application review",
  robots: { index: false, follow: false },
};

const CLUSTER_KEYS = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
] as const;

const DOC_LABELS: Record<string, string> = {
  IDENTIFICATION: "Identification",
  BUSINESS_REGISTRATION: "Business registration",
  PITCH_DECK: "Pitch deck",
  BUSINESS_PLAN: "Business plan",
  PRODUCT_IMAGES: "Product images",
  FINANCIAL_INFO: "Financial information",
  OTHER: "Other",
};

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await getSession();

  const application = await safeQuery(
    () =>
      prisma.application.findUnique({
        where: { id },
        include: {
          user: true,
          cohort: true,
          documents: true,
          notes: { orderBy: { createdAt: "desc" } },
          reviews: { include: { reviewer: true, scores: true } },
        },
      }),
    null,
  );

  if (!application) notFound();

  const criteria = await safeQuery(
    () =>
      prisma.scoringCriterion.findMany({
        where: { cohortId: application.cohortId },
        orderBy: { order: "asc" },
      }),
    [],
  );

  const myReview = application.reviews.find((r) => r.reviewerId === admin?.id);
  const scored = application.reviews.filter((r) => r.submittedAt);
  const average =
    scored.length > 0 ? scored.reduce((s, r) => s + r.total, 0) / scored.length : null;

  const clusterIndex = application.cluster ? CLUSTER_KEYS.indexOf(application.cluster) : -1;
  const cluster = clusterIndex >= 0 ? CLUSTERS[clusterIndex] : null;

  const age = yearsSince(application.dateOfBirth);

  const businessFields: [string, string | null][] = [
    ["Business description", application.businessDescription],
    ["Problem being solved", application.problemSolved],
    ["Product / service", application.productService],
    ["Target market", application.targetMarket],
    ["Current customers", application.currentCustomers],
    ["Current challenges", application.challenges],
    ["Growth plans", application.growthPlans],
    ["Intended use of funding", application.fundingUse],
  ];

  const founderFields: [string, string | null][] = [
    ["Founder background", application.founderBackground],
    ["Relevant experience", application.experience],
    ["Education / training", application.education],
    ["Previous ventures", application.priorVenture],
    ["Motivation for joining", application.motivation],
    ["Goals for participation", application.goals],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-lime-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All applications
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
            {application.reference} · {application.cohort.name}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">
            {application.businessName ?? application.user.fullName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.88rem] text-ink-500">
            <span>{application.user.fullName}</span>
            {age !== null && <span>{age} years old</span>}
            {application.gender && <span>{application.gender}</span>}
            {application.community && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {application.community}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {average !== null && (
            <div className="rounded-2xl bg-ink-950 px-5 py-3 text-center text-white">
              <p className="font-display text-2xl font-bold">{average.toFixed(1)}</p>
              <p className="text-[0.65rem] tracking-wide text-white/50 uppercase">
                avg · {scored.length} review{scored.length === 1 ? "" : "s"}
              </p>
            </div>
          )}
          <span
            className={cn(
              "rounded-full px-4 py-2 text-[0.8rem] font-semibold",
              STATUS_CLASSES[application.status],
            )}
          >
            {STATUS_META[application.status].label}
          </span>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* ------------------------------------------------------ detail */}
        <div className="space-y-6">
          <Card title="At a glance">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
              {[
                ["Cluster", cluster?.name ?? "—"],
                ["Business location", application.businessLocation ?? "—"],
                ["Registration", application.registrationStatus?.replace(/_/g, " ").toLowerCase() ?? "—"],
                ["Stage", application.businessStage?.replace(/_/g, " ").toLowerCase() ?? "—"],
                ["Monthly revenue", application.monthlyRevenue ?? "—"],
                ["Employees", String(application.employees ?? "—")],
                ["Years operating", String(application.yearsOperating ?? "—")],
                [
                  "Funding requested",
                  application.fundingRequired ? ghs(application.fundingRequired) : "—",
                ],
                [
                  "Submitted",
                  application.submittedAt ? formatDateTime(application.submittedAt) : "Not submitted",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.7rem] font-semibold tracking-wide text-ink-500 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-[0.9rem] text-ink-900 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Business information">
            <div className="space-y-5">
              {businessFields.map(([label, value]) => (
                <Detail key={label} label={label} value={value} />
              ))}
            </div>
          </Card>

          <Card title="Founder information">
            <div className="space-y-5">
              {founderFields.map(([label, value]) => (
                <Detail key={label} label={label} value={value} />
              ))}
              {application.referralSource && (
                <Detail label="Heard about the programme via" value={application.referralSource} />
              )}
            </div>
          </Card>

          <Card title={`Documents (${application.documents.length})`}>
            {application.documents.length === 0 ? (
              <p className="text-[0.88rem] text-ink-500">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {application.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl bg-lime-50 px-4 py-3"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-lime-700" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-[0.88rem] font-medium text-ink-900 hover:underline"
                      >
                        {doc.fileName}
                      </a>
                      <p className="text-[0.72rem] text-ink-500">
                        {DOC_LABELS[doc.kind] ?? doc.kind}
                        {doc.size ? ` · ${Math.round(doc.size / 1024)} KB` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Internal notes">
            <NotePanel applicationId={application.id} />
            {application.notes.length > 0 && (
              <ul className="mt-6 space-y-4 border-t border-ink-900/8 pt-6">
                {application.notes.map((note) => (
                  <li key={note.id} className="border-l-2 border-lime-400 pl-4">
                    <p className="text-[0.88rem] leading-relaxed text-ink-900">{note.body}</p>
                    <p className="mt-1.5 text-[0.72rem] text-ink-500">
                      {note.authorName} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ----------------------------------------------------- sidebar */}
        <div className="space-y-6">
          <Card title="Contact">
            <ul className="space-y-3 text-[0.88rem]">
              <li>
                <a
                  href={`mailto:${application.user.email}`}
                  className="flex items-center gap-3 text-ink-500 transition-colors hover:text-lime-700"
                >
                  <Mail className="h-4 w-4 shrink-0 text-lime-600" />
                  <span className="truncate">{application.user.email}</span>
                </a>
              </li>
              {application.user.phone && (
                <li>
                  <a
                    href={`tel:${application.user.phone}`}
                    className="flex items-center gap-3 text-ink-500 transition-colors hover:text-lime-700"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-lime-600" />
                    {application.user.phone}
                  </a>
                </li>
              )}
              {application.dateOfBirth && (
                <li className="flex items-center gap-3 text-ink-500">
                  <span className="w-4 shrink-0" />
                  Born {formatDate(application.dateOfBirth)}
                </li>
              )}
            </ul>
            <p className="mt-5 border-t border-ink-900/8 pt-4 text-[0.75rem] leading-relaxed text-ink-500">
              Public profile consent:{" "}
              <strong className="text-ink-900">
                {application.consentPublic ? "granted" : "not granted"}
              </strong>
            </p>
          </Card>

          <Card title="Status">
            <StatusPanel
              applicationId={application.id}
              current={application.status}
              hasPhone={Boolean(application.user.phone)}
            />
          </Card>

          <Card title="Your scorecard">
            <ScorePanel
              applicationId={application.id}
              criteria={criteria}
              existing={
                myReview
                  ? {
                      comment: myReview.comment,
                      total: myReview.total,
                      scores: Object.fromEntries(
                        myReview.scores.map((s) => [s.criterionId, s.value]),
                      ),
                    }
                  : null
              }
            />
          </Card>

          {scored.length > 0 && (
            <Card title="All reviews">
              <ul className="space-y-4">
                {scored.map((review) => (
                  <li key={review.id} className="rounded-xl bg-lime-50 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.85rem] font-medium text-ink-900">
                        {review.reviewer.fullName}
                      </span>
                      <span className="font-display font-bold text-lime-700">
                        {review.total.toFixed(1)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-500">
                        {review.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/** Whole years between a date of birth and now, or null if unknown. */
function yearsSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((new Date().getTime() - date.getTime()) / 31_557_600_000);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink-900/8 bg-white p-6 sm:p-7">
      <h2 className="mb-5 font-display text-lg text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold tracking-wide text-ink-500 uppercase">{label}</p>
      <p className="mt-1 leading-relaxed whitespace-pre-line text-ink-900">{value || "—"}</p>
    </div>
  );
}
