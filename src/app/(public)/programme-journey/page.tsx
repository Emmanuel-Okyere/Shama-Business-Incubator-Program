import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { JOURNEY, PROGRAMME } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Programme Journey",
  description:
    "Eight tracked stages: Application, Selection, Onboarding, Bootcamp, Internal Pitch, Ultimate Pitch, Funding and Growth.",
};

const DETAIL: Record<string, string[]> = {
  Application: [
    "Create an account and start your application online",
    "Save your progress and return any time before the deadline",
    "Upload identification, business documents and product images",
    "Receive an SMS confirmation with your reference number",
  ],
  Selection: [
    "Applications screened against eligibility criteria",
    "Scored on viability, innovation, market, scalability, founder capability, impact and funding need",
    "Shortlisted applicants invited to interview or assessment",
    "100 participants selected — 25 per cluster",
  ],
  Onboarding: [
    "Orientation session and programme handbook",
    "Cluster allocation confirmed",
    "Mentor matching by cluster, industry and business need",
    "Access to your participant dashboard and calendar",
  ],
  "8-Week Bootcamp": [
    "Interactive workshops and expert-led sessions",
    "Assignments with tracked submission deadlines",
    "Attendance recorded at every session",
    "Continuous feedback from mentors and facilitators",
  ],
  "Internal Pitch": [
    "Pitch within your cluster at the end of week 8",
    "Scored on viability, innovation, market potential and scalability",
    "Top five per cluster progress",
    "20 finalists identified across the cohort",
  ],
  "Ultimate Pitch": [
    "One week of intensive pitch coaching",
    "Financial projections and business refinement",
    "Pitch before judges, investors and stakeholders",
    "Digital scoring against weighted criteria",
  ],
  Funding: [
    "Grant allocation based on final ranking",
    "GHS 10,000 to GHS 50,000 per business",
    "Disbursement recorded with conditions and use-of-funds",
    "Follow-up reporting on how capital is deployed",
  ],
  Growth: [
    "Quarterly Growth Labs to track performance",
    "Continued access to your mentor",
    "Impact data collected on revenue, jobs and customers",
    "Showcase at the Annual Cohort Exit",
  ],
};

export default function JourneyPage() {
  return (
    <>
      <PageHero
        eyebrow="Programme Journey"
        crumbs={[{ label: "Journey", href: "/programme-journey" }]}
        title={
          <>
            Discover. Apply. Learn. Pitch.
            <br />
            <span className="text-lime-400">Get funded. Grow.</span>
          </>
        }
        lead={`Every participant in ${PROGRAMME.cohort} moves through the same eight tracked stages — and can see exactly where they stand from their dashboard at any time.`}
        image="/brand/photo-branding.webp"
        imagePosition="center"
      />

      <Section>
        <ol className="relative">
          <span
            className="absolute top-4 bottom-4 left-[1.4rem] hidden w-px bg-gradient-to-b from-lime-500 via-lime-300 to-ink-900/10 sm:block"
            aria-hidden
          />
          {JOURNEY.map((step, i) => (
            <Reveal key={step.stage} delay={i * 50} as="li" className="relative">
              <div className="flex gap-6 pb-10 sm:gap-8">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime-500 font-display text-sm font-bold text-ink-950 ring-8 ring-white">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex-1 rounded-3xl border border-ink-900/8 bg-white p-7 transition-shadow duration-300 hover:shadow-lift sm:p-8">
                  <h2 className="font-display text-2xl text-ink-900">{step.stage}</h2>
                  <p className="mt-2.5 leading-relaxed text-ink-500">{step.detail}</p>

                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {(DETAIL[step.stage] ?? []).map((d) => (
                      <li
                        key={d}
                        className="flex gap-2.5 rounded-xl bg-lime-50 px-4 py-3 text-[0.88rem] leading-snug text-ink-500"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section className="bg-lime-500 py-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl text-ink-950 sm:text-3xl">
              Stage one starts with an application.
            </h2>
            <p className="mt-2 text-ink-950/70">
              Free to apply. Save and return any time before the deadline.
            </p>
          </div>
          <Button href="/apply" variant="dark" size="lg" className="shrink-0">
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}
