import type { Metadata } from "next";
import { ArrowRight, ClipboardCheck, ShieldCheck, Scale } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FundingTiers } from "@/components/site/FundingTiers";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { TOTAL_FUNDING, ghs } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Funding Model",
  description:
    "GHS 480,000 in tiered grant funding allocated to 20 finalists based on performance at the Ultimate Pitch. Grants, not loans.",
};

const CRITERIA = [
  { name: "Business viability", weight: "Can this business sustain itself?" },
  { name: "Innovation and differentiation", weight: "What makes it different from what exists?" },
  { name: "Market potential", weight: "How big is the demand, and is it proven?" },
  { name: "Scalability", weight: "Can it grow without breaking?" },
  { name: "Financial sustainability", weight: "Do the numbers hold up under scrutiny?" },
  { name: "Founder / team capability", weight: "Can this person execute?" },
  { name: "Social / economic impact", weight: "What does Shama gain?" },
];

export default function FundingPage() {
  return (
    <>
      <PageHero
        eyebrow="Funding Model"
        crumbs={[{ label: "Funding", href: "/funding" }]}
        title={
          <>
            {ghs(TOTAL_FUNDING)} in grant capital.
            <br />
            <span className="text-lime-400">Twenty businesses funded.</span>
          </>
        }
        lead="Grant funding — not a loan, not equity — allocated on performance at the Ultimate Pitch before judges, investors and stakeholders."
      image="/brand/photo-investor-readiness.webp"
      />

      <Section>
        <SectionHead
          eyebrow="Tiered Structure"
          title="How the money is allocated"
          lead="The 20 finalists — five from each cluster — are ranked on their Ultimate Pitch. Ranking determines the tier."
        />
        <div className="mt-14">
          <FundingTiers />
        </div>
      </Section>

      <Section className="bg-ink-950 text-white">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead
              tone="dark"
              eyebrow="Judging Criteria"
              title="What judges score you on"
              lead="The scoring system is configurable by the programme team, with weights and maximum scores set before judging opens. Judges cannot see each other's scores until scoring closes."
            />
          </div>

          <ul className="space-y-3">
            {CRITERIA.map((c, i) => (
              <Reveal key={c.name} delay={i * 55} as="li">
                <div className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
                  <span className="font-display text-sm font-bold text-lime-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="mt-1 text-[0.85rem] text-white/45">{c.weight}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="After the award"
          title="Funding comes with accountability"
          lead="Grant capital is tracked from allocation to disbursement to deployment. This protects the programme, the partners funding it, and the businesses themselves."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: ClipboardCheck,
              title: "Recorded allocation",
              body: "Winner category, approved amount, funding status, disbursement date and reference are all recorded against your business record.",
            },
            {
              icon: Scale,
              title: "Use-of-funds reporting",
              body: "You state what the funding is for in your application and report on how it was actually deployed during the Growth Labs.",
            },
            {
              icon: ShieldCheck,
              title: "Confidential by default",
              body: "Financial information is visible only to authorised programme administrators. It is never published without your consent.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-100 text-lime-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-lg text-ink-900">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-500">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-lime-50 px-8 py-10 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl text-ink-900">
              Funding starts with getting into the cohort.
            </h3>
            <p className="mt-2 text-ink-500">
              Only participants who complete the bootcamp can pitch.
            </p>
          </div>
          <Button href="/apply" size="lg" className="shrink-0">
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}
