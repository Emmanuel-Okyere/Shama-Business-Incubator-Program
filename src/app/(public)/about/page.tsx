import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import { FAQ } from "@/components/site/FAQ";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { OPPORTUNITY, PROGRAMME, TIMELINE } from "@/lib/programme";

export const metadata: Metadata = {
  title: "About the Incubator",
  description:
    "The Shama Business Incubator is a structured entrepreneurship programme identifying, developing and funding high-potential young entrepreneurs in the Shama Constituency.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the Incubator"
        crumbs={[{ label: "About", href: "/about" }]}
        title={
          <>
            Not just training entrepreneurs.
            <br />
            <span className="text-lime-400">Building businesses that last.</span>
          </>
        }
        lead="A structured entrepreneurship programme designed to identify, develop and fund high-potential young entrepreneurs within the Shama Constituency."
        image="/brand/photo-investor-readiness.webp"
        imagePosition="center"
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-ink-500">
            <p>
              The Shama Business Incubator provides a clear and practical pathway from idea to
              sustainable business by combining hands-on training, mentorship, and access to capital.
            </p>
            <p>
              Through an integrated approach — <strong className="text-ink-900">Ignite, Fund,
              Scale</strong> — the programme equips participants aged {PROGRAMME.ageRange} with
              essential business and financial skills, supports them with expert guidance, and
              invests in viable ideas through a competitive pitch process. Beyond funding, the
              incubator offers continued support to help businesses launch, grow and scale
              successfully.
            </p>
            <p>
              What sets it apart is its focus on real outcomes: not just training entrepreneurs, but
              building resilient businesses that create jobs, drive innovation, and contribute to the
              economic development of Shama.
            </p>

            <div className="!mt-10 rounded-3xl bg-lime-50 p-8">
              <h3 className="font-display text-xl text-ink-900">The core principle</h3>
              <p className="mt-3 text-[1.05rem] font-medium text-lime-700">
                One platform. One entrepreneur journey. One source of programme data.
              </p>
              <p className="mt-3 text-[0.95rem]">
                From the first application to the fourth quarterly Growth Lab, every participant has
                a single consolidated record — no scattered spreadsheets, no lost paperwork, no
                guessing at who is progressing and who is stuck.
              </p>
            </div>
          </div>

          <Reveal>
            <figure className="overflow-hidden rounded-3xl bg-ink-950 text-white">
              <div className="relative aspect-[4/3] bg-lime-500/10">
                <Image
                  src="/brand/hon-emelia-arthur.webp"
                  alt={PROGRAMME.initiator}
                  fill
                  sizes="(max-width: 1024px) 100vw, 460px"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="p-8">
                <Quote className="h-7 w-7 text-lime-400" />
                <blockquote className="mt-4 font-display text-lg leading-snug">
                  Shama has no shortage of people with ideas and drive. What has been missing is
                  capital, structure and someone in the room who has done it before.
                </blockquote>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-display font-bold">{PROGRAMME.initiator}</p>
                  <p className="mt-1 text-[0.8rem] leading-snug text-white/50">
                    {PROGRAMME.initiatorRole}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-ink-950 text-white">
        <SectionHead
          tone="dark"
          eyebrow="The Opportunity"
          title="Why Shama, and why now"
          lead="The constituency has entrepreneurial energy. It does not yet have the infrastructure that turns that energy into surviving businesses."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITY.map((item, i) => (
            <Reveal key={item} delay={i * 70}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <span className="font-display text-xs font-bold tracking-[0.16em] text-lime-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 leading-relaxed text-white/70">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Timeline"
          title={`${PROGRAMME.cohort}: ${PROGRAMME.period}`}
          lead="Six months from fundraising to funded businesses, with clear deliverables at every phase."
        />

        <ol className="mt-14 space-y-3">
          {TIMELINE.map((phase, i) => (
            <Reveal key={phase.month} delay={i * 60} as="li">
              <div className="group grid gap-6 rounded-3xl border border-ink-900/8 bg-white p-7 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lift sm:grid-cols-[7rem_1fr_1.1fr] sm:items-start sm:gap-8">
                <div className="flex items-center gap-3 sm:block">
                  <span className="font-display text-2xl font-bold text-lime-600">
                    {phase.month}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-[1.05rem] leading-snug text-ink-900">
                    {phase.phase}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {phase.deliverables.map((d) => (
                    <li key={d} className="flex gap-2.5 text-[0.9rem] leading-snug text-ink-500">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section id="faq" className="bg-lime-50/60">
        <SectionHead
          eyebrow="FAQ"
          title="Questions applicants actually ask"
          align="center"
        />
        <div className="mx-auto mt-14 max-w-3xl">
          <FAQ />
        </div>
        <div className="mt-10 text-center">
          <Button href="/contact" variant="outline">
            Still have a question? Contact the team
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}
