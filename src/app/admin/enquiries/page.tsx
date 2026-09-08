import type { Metadata } from "next";
import { Inbox, Mail, Phone } from "lucide-react";
import { prisma, safeQuery } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

const STATUS_CLASS: Record<string, string> = {
  NEW: "bg-lime-200 text-lime-900",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-ink-900/8 text-ink-500",
};

export default async function EnquiriesPage() {
  const [enquiries, mentorInterest] = await Promise.all([
    safeQuery(
      () => prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      [],
    ),
    safeQuery(
      () => prisma.mentorInterest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      [],
    ),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Contact & enquiries
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Enquiries</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
          <div className="border-b border-ink-900/8 px-7 py-5">
            <h2 className="font-display text-lg text-ink-900">
              Website enquiries ({enquiries.length})
            </h2>
          </div>

          {enquiries.length === 0 ? (
            <div className="px-7 py-16 text-center">
              <Inbox className="mx-auto h-8 w-8 text-ink-500/40" />
              <p className="mt-4 text-[0.9rem] text-ink-500">No enquiries received yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id} className="px-7 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">{enquiry.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-ink-500">
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="inline-flex items-center gap-1.5 hover:text-lime-700"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {enquiry.email}
                        </a>
                        {enquiry.phone && (
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="inline-flex items-center gap-1.5 hover:text-lime-700"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {enquiry.phone}
                          </a>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-ink-900/5 px-3 py-1 text-[0.72rem] font-medium text-ink-500">
                        {enquiry.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[0.72rem] font-semibold",
                          STATUS_CLASS[enquiry.status],
                        )}
                      >
                        {enquiry.status.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-500">
                    {enquiry.message}
                  </p>
                  <p className="mt-2 text-[0.72rem] text-ink-500/70">
                    {formatDateTime(enquiry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
          <div className="border-b border-ink-900/8 px-7 py-5">
            <h2 className="font-display text-lg text-ink-900">
              Mentor volunteers ({mentorInterest.length})
            </h2>
          </div>

          {mentorInterest.length === 0 ? (
            <div className="px-7 py-16 text-center">
              <p className="text-[0.9rem] text-ink-500">No mentor registrations yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {mentorInterest.map((mentor) => (
                <li key={mentor.id} className="px-7 py-5">
                  <p className="font-medium text-ink-900">{mentor.fullName}</p>
                  {mentor.organisation && (
                    <p className="text-[0.8rem] text-ink-500">{mentor.organisation}</p>
                  )}
                  <p className="mt-2 text-[0.85rem] text-ink-500">{mentor.expertise}</p>
                  {mentor.clusters.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {mentor.clusters.map((c) => (
                        <li
                          key={c}
                          className="rounded-full bg-lime-100 px-2.5 py-1 text-[0.7rem] text-lime-800"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2.5 text-[0.72rem] text-ink-500/70">
                    {mentor.email} · {formatDateTime(mentor.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
