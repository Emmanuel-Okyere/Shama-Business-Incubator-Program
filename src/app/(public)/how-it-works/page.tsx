import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Target } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Pipeline } from "@/components/home/Pipeline";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { VALUE_PROPS } from "@/lib/programme";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Identify, Train, Mentor, Pitch, Fund, Scale — the end-to-end pipeline of the Shama Business Incubator, including the 8-week bootcamp and the pitch pipeline.",
};

const PHASES = [
  {
    n: "Phase 1",
    title: "Bootcamp — Weeks 1–8",
    lead: "An immersive, hands-on learning experience focused on building viable businesses.",
    areas: [
      "Business model development and refinement",
      "Financial literacy",
      "Branding, marketing and storytelling",
      "Market validation",
      "Operations, growth and scalability",
    ],
    approach: [
      "Interactive workshops and expert-led sessions",
      "Continuous feedback from mentors",
    ],
    outcome:
      "Participants move from raw ideas or early-stage ventures to structured, market-ready business models.",
  },
  {
    n: "Phase 2",
    title: "Internal Pitch — End of Week 8",
    lead: "Participants pitch within their respective clusters.",
    areas: [
      "Business viability",
      "Innovation and differentiation",
      "Market potential and scalability",
    ],
    approach: [
      "Top 5 participants per cluster selected",
      "A total of 20 finalists across four clusters",
    ],
    outcome:
      "The most promising businesses are identified and prepared for investment.",
  },
  {
    n: "Phase 3",
    title: "Ultimate Pitch — One week later",
    lead: "Finalists pitch before a panel of judges, investors and stakeholders.",
    areas: ["Pitch coaching", "Financial projections", "Business refinement"],
    approach: [
      "Digital scoring against weighted criteria",
      "Final selection determines funding allocation",
    ],
    outcome:
      "Participants secure funding and transition into the growth phase of their businesses.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        crumbs={[{ label: "How It Works", href: "/how-it-works" }]}
        title={
          <>
            Identify. Train. Mentor.
            <br />
            <span className="text-lime-400">Pitch. Fund. Scale.</span>
          </>
        }
        lead="An end-to-end entrepreneurial pipeline. Nothing about this programme stops at a certificate."
        image="/brand/photo-bootcamp.webp"
        imagePosition="center"
      >
        <Button href="/apply" size="lg">
          Start your application
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHero>

      <Section>
        <SectionHead
          eyebrow="The Pipeline"
          title="Six stages, one continuous journey"
          lead="Select a stage to see what happens inside it — and what you walk away with."
        />
        <div className="mt-14">
          <Pipeline />
        </div>
      </Section>

      <Section className="bg-lime-50/60">
        <SectionHead
          eyebrow="Programme Flow"
          title="8-week bootcamp plus the pitch pipeline"
          lead="A structured journey from idea to investment-ready business, combining intensive training with real-world validation."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PHASES.map((phase, i) => (
            <Reveal key={phase.n} delay={i * 90} as="article">
              <div className="flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-8">
                <span className="bracket-frame inline-flex self-start">
                  <span className="rounded-md bg-lime-500 px-3 py-1.5 font-display text-[0.68rem] font-bold tracking-[0.14em] text-ink-950 uppercase">
                    {phase.n}
                  </span>
                </span>

                <h3 className="mt-7 font-display text-xl leading-snug text-ink-900">
                  {phase.title}
                </h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-500">{phase.lead}</p>

                <p className="mt-7 text-[0.7rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                  Key areas
                </p>
                <ul className="mt-3 space-y-2">
                  {phase.areas.map((a) => (
                    <li key={a} className="flex gap-2.5 text-[0.88rem] leading-snug text-ink-500">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-600" />
                      {a}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-[0.7rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                  Approach
                </p>
                <ul className="mt-3 space-y-2">
                  {phase.approach.map((a) => (
                    <li key={a} className="flex gap-2.5 text-[0.88rem] leading-snug text-ink-500">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex gap-3 rounded-2xl bg-ink-950 p-5 pt-5 text-white">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-lime-400" />
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-lime-300 uppercase">
                      Outcome
                    </p>
                    <p className="mt-1.5 text-[0.88rem] leading-relaxed text-white/70">
                      {phase.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Value Proposition"
          title="What you actually receive"
          lead="A holistic support system that equips entrepreneurs not just to start, but to build sustainable, competitive businesses."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {VALUE_PROPS.map((prop, i) => (
            <Reveal key={prop.title} delay={i * 80} as="article">
              <div className="flex h-full flex-col gap-6 overflow-hidden rounded-3xl bg-lime-300/30 p-5 sm:flex-row sm:p-6">
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-white sm:h-auto sm:w-44">
                  <Image
                    src={prop.photo}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 176px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-ink-900">{prop.title}</h3>
                  <p className="mt-2 text-[0.9rem] text-ink-900/60">{prop.intro}</p>
                  <ul className="mt-4 space-y-2.5">
                    {prop.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-[0.9rem] leading-snug text-ink-900/75"
                      >
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-700" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
