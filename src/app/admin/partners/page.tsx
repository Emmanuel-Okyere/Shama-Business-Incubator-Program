import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import type { PipelineStage } from "@prisma/client";
import { prisma, safeQuery } from "@/lib/db";
import { PARTNER_CATEGORIES, ghs } from "@/lib/programme";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Partner pipeline",
  robots: { index: false, follow: false },
};

const STAGES: PipelineStage[] = [
  "PROSPECT",
  "CONTACTED",
  "MEETING",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "COMMITTED",
  "RECEIVED",
  "CLOSED",
];

const STAGE_LABEL: Record<PipelineStage, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  MEETING: "Meeting",
  PROPOSAL_SENT: "Proposal sent",
  NEGOTIATION: "Negotiation",
  COMMITTED: "Committed",
  RECEIVED: "Received",
  CLOSED: "Closed",
};

export default async function PartnersAdminPage() {
  const leads = await safeQuery(
    () => prisma.partnerLead.findMany({ orderBy: { createdAt: "desc" } }),
    [],
  );

  const committed = leads
    .filter((l) => ["COMMITTED", "RECEIVED"].includes(l.stage))
    .reduce((sum, l) => sum + (l.potentialValue ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Fundraising
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Partner pipeline</h1>
        <p className="mt-2 text-ink-500">
          {leads.length} lead{leads.length === 1 ? "" : "s"} · {ghs(committed)} committed or received
        </p>
      </header>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-900/15 bg-white px-8 py-20 text-center">
          <Handshake className="mx-auto h-8 w-8 text-ink-500/40" />
          <h2 className="mt-5 font-display text-xl text-ink-900">No partner leads yet</h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
            Enquiries submitted through the Partners page land here. The pipeline is organised
            around three networks:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {PARTNER_CATEGORIES.map((c) => (
              <span
                key={c.name}
                className="rounded-full bg-lime-50 px-4 py-2 text-[0.8rem] font-medium text-ink-500"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 overflow-x-auto pb-4 lg:grid-flow-col lg:auto-cols-[16rem]">
          {STAGES.map((stage) => {
            const inStage = leads.filter((l) => l.stage === stage);
            return (
              <section key={stage} className="min-w-[15rem]">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-[0.9rem] font-bold text-ink-900">
                    {STAGE_LABEL[stage]}
                  </h2>
                  <span className="text-[0.75rem] text-ink-500">{inStage.length}</span>
                </div>
                <ul className="space-y-2">
                  {inStage.map((lead) => (
                    <li
                      key={lead.id}
                      className="rounded-2xl border border-ink-900/8 bg-white p-4"
                    >
                      <p className="text-[0.88rem] font-semibold text-ink-900">
                        {lead.organisation}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] text-ink-500">{lead.contactPerson}</p>
                      {lead.level && (
                        <p className="mt-2 inline-block rounded-full bg-lime-100 px-2.5 py-1 text-[0.7rem] font-medium text-lime-800">
                          {lead.level}
                        </p>
                      )}
                      <p className="mt-2 text-[0.72rem] text-ink-500/70">
                        {formatDate(lead.createdAt)}
                      </p>
                    </li>
                  ))}
                  {inStage.length === 0 && (
                    <li className="rounded-2xl border border-dashed border-ink-900/10 px-4 py-6 text-center text-[0.78rem] text-ink-500/60">
                      Empty
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
