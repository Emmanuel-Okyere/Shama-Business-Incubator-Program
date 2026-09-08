import type { Metadata } from "next";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Coins,
  Handshake,
  LineChart,
  Sprout,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { getSettings, num } from "@/lib/settings";
import { BEYOND_INCUBATOR, EXPECTED_IMPACT, ghs } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Entrepreneurs trained, businesses funded, jobs created and capital deployed — the Shama Business Incubator impact dashboard.",
};

// Figures here are admin-editable; revalidatePath refreshes them on save, and
// this is the backstop if the data changes outside the admin UI.
export const revalidate = 300;

const TRACKED = [
  "Business operating status",
  "Monthly revenue range",
  "Number of employees",
  "Number of customers",
  "New customers acquired",
  "Products / services launched",
  "Funding received",
  "Additional capital raised",
  "Jobs created",
  "Business challenges",
  "Support required",
];

export default async function ImpactPage() {
  const settings = await getSettings();

  const indicators = [
    { icon: Users, label: "Entrepreneurs trained", value: num(settings, "impact_trained"), target: num(settings, "stat_entrepreneurs") },
    { icon: Building2, label: "Businesses supported", value: num(settings, "impact_supported"), target: num(settings, "stat_entrepreneurs") },
    { icon: Coins, label: "Businesses funded", value: num(settings, "impact_funded"), target: num(settings, "stat_funded") },
    { icon: Banknote, label: "Total funding awarded", value: num(settings, "impact_funding_awarded"), target: num(settings, "stat_funding"), money: true },
    { icon: Briefcase, label: "Jobs created", value: num(settings, "impact_jobs") },
    { icon: Sprout, label: "Businesses still operating", value: num(settings, "impact_still_operating") },
    { icon: LineChart, label: "Businesses generating revenue", value: num(settings, "impact_generating_revenue") },
    { icon: Handshake, label: "Partnerships secured", value: num(settings, "impact_partnerships") },
  ];

  const started = indicators.some((i) => i.value > 0);

  return (
    <>
      <PageHero
        eyebrow="Impact"
        crumbs={[{ label: "Impact", href: "/impact" }]}
        title={
          <>
            Measured on what happens
            <br />
            <span className="text-lime-400">after the funding lands.</span>
          </>
        }
        lead="Tangible, trackable impact — not participation numbers. Every figure below is maintained from the programme database as the cohort progresses."
      image="/brand/photo-shama-coast.webp"
      />

      <Section>
        {!started && (
          <div className="mb-12 rounded-3xl border border-dashed border-ink-900/15 bg-lime-50/60 px-8 py-10">
            <p className="font-display text-lg text-ink-900">
              {`Cohort 1 is in progress — impact reporting begins after selection.`}
            </p>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-500">
              These indicators update automatically as participants are onboarded, trained, funded
              and reported on through the quarterly Growth Labs. The targets shown alongside are the
              programme&apos;s commitments for this cohort.
            </p>
          </div>
        )}

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((item, i) => (
            <Reveal key={item.label} delay={i * 55}>
              <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-100 text-lime-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <dt className="mt-6 text-[0.8rem] font-medium text-ink-500">{item.label}</dt>
                <dd className="mt-1.5 font-display text-3xl font-bold text-ink-900">
                  {item.money ? (
                    <>
                      <span className="text-xl">GHS </span>
                      <Counter to={item.value} />
                    </>
                  ) : (
                    <Counter to={item.value} />
                  )}
                </dd>
                {item.target ? (
                  <>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-900/8">
                      <div
                        className="h-full rounded-full bg-lime-500 transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (item.value / Math.max(1, item.target)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[0.72rem] text-ink-500/70">
                      Target: {item.money ? ghs(item.target) : item.target.toLocaleString("en-GB")}
                    </p>
                  </>
                ) : null}
              </div>
            </Reveal>
          ))}
        </dl>
      </Section>

      <Section className="bg-ink-950 text-white">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHead
              tone="dark"
              eyebrow="Expected Impact"
              title="What Cohort 1 is designed to deliver"
            />
            <ul className="mt-10 space-y-3">
              {EXPECTED_IMPACT.map((item, i) => (
                <Reveal key={item} delay={i * 60} as="li">
                  <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
                    <span className="font-display text-sm font-bold text-lime-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{item}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead
              tone="dark"
              eyebrow="Data Collection"
              title="What we ask businesses, quarterly"
              lead="The platform periodically requests business updates from participants — after graduation as well as during the programme."
            />
            <ul className="mt-10 flex flex-wrap gap-2">
              {TRACKED.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/12 px-4 py-2 text-[0.82rem] text-white/60"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Beyond the Incubator"
          title="The programme does not end at graduation"
          lead="Long-term success, scalability and recurring impact are built into the design."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {BEYOND_INCUBATOR.map((block, i) => (
            <Reveal key={block.title} delay={i * 80} as="article">
              <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-8">
                <span className="bracket-frame inline-flex">
                  <span className="rounded-md bg-lime-500 px-2.5 py-1 font-display text-[0.7rem] font-bold text-ink-950">
                    {block.n}
                  </span>
                </span>
                <h3 className="mt-7 font-display text-xl text-ink-900">{block.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {block.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink-500">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-lime-50 px-8 py-10 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl text-ink-900">
              Partners receive this reporting quarterly.
            </h3>
            <p className="mt-2 text-ink-500">
              Traceable to named businesses, drawn from the programme database.
            </p>
          </div>
          <Button href="/partners#become-a-partner" size="lg" className="shrink-0">
            Become a partner
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}
