import type { Metadata } from "next";
import { ArrowRight, Building2, Check, HeartHandshake, Landmark } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SponsorForm } from "@/components/site/forms/SponsorForm";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { PARTNER_CATEGORIES, SPONSOR_LEVELS, TOTAL_FUNDING, ghs } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Partners & Sponsors",
  description:
    "Sponsorship packages from GHS 100,000 Supporter to GHS 1,000,000 Title Sponsor. Back 100 entrepreneurs in Shama.",
};

// Figures here are admin-editable; revalidatePath refreshes them on save, and
// this is the backstop if the data changes outside the admin UI.
export const revalidate = 300;

const CATEGORY_ICONS = [Building2, Landmark, HeartHandshake];

export default async function PartnersPage() {
  const partners = await safeQuery(
    () => prisma.partner.findMany({ orderBy: { order: "asc" } }),
    [],
  );

  return (
    <>
      <PageHero
        eyebrow="Partners & Sponsors"
        crumbs={[{ label: "Partners", href: "/partners" }]}
        title={
          <>
            Fund a cluster.
            <br />
            <span className="text-lime-400">Change a constituency.</span>
          </>
        }
        lead={`The programme is putting ${ghs(TOTAL_FUNDING)} of grant capital into 20 businesses. Partners make that possible — and see exactly where it lands.`}
      image="/brand/photo-bootcamp.webp"
        imagePosition="center"
      >
        <Button href="#become-a-partner" size="lg">
          Sponsorship packages
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHero>

      {partners.length > 0 && (
        <Section className="py-16">
          <p className="text-center text-[0.72rem] font-semibold tracking-[0.18em] text-ink-500 uppercase">
            Current partners and sponsors
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {partners.map((p) => (
              <span key={p.id} className="font-display text-lg font-bold text-ink-900/30">
                {p.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <SectionHead
          eyebrow="Sponsorship Levels"
          title="Four ways to back the cohort"
          lead="Every level carries recognition, reporting and a direct line to the businesses your money supports."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {SPONSOR_LEVELS.map((level, i) => {
            const flagship = i === SPONSOR_LEVELS.length - 1;
            return (
              <Reveal key={level.level} delay={i * 80} as="article" className="h-full">
                <div
                  className={
                    flagship
                      ? "flex h-full flex-col rounded-3xl bg-ink-950 p-8 text-white"
                      : "flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-8 transition-shadow hover:shadow-card"
                  }
                >
                  <p
                    className={
                      flagship
                        ? "text-[0.7rem] font-semibold tracking-[0.14em] text-lime-300 uppercase"
                        : "text-[0.7rem] font-semibold tracking-[0.14em] text-lime-700 uppercase"
                    }
                  >
                    {level.level}
                  </p>
                  <p
                    className={
                      flagship
                        ? "mt-4 font-display text-3xl font-bold"
                        : "mt-4 font-display text-3xl font-bold text-ink-900"
                    }
                  >
                    {ghs(level.amount)}
                  </p>

                  <ul className="mt-7 flex-1 space-y-3">
                    {level.benefits.map((b) => (
                      <li
                        key={b}
                        className={
                          flagship
                            ? "flex gap-2.5 text-[0.88rem] leading-snug text-white/65"
                            : "flex gap-2.5 text-[0.88rem] leading-snug text-ink-500"
                        }
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Button
                    href="#become-a-partner"
                    variant={flagship ? "primary" : "outline"}
                    size="sm"
                    className="mt-8"
                  >
                    Enquire
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section className="bg-lime-50/60">
        <SectionHead
          eyebrow="Partnership Pipeline"
          title="Who we are talking to"
          lead="The programme's fundraising is organised around three networks."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PARTNER_CATEGORIES.map((cat, i) => {
            const Icon = CATEGORY_ICONS[i];
            return (
              <Reveal key={cat.name} delay={i * 80}>
                <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-8">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-100 text-lime-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-display text-lg leading-snug text-ink-900">
                    {cat.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-500">{cat.detail}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="become-a-partner">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead
              eyebrow="Become a Partner"
              title="Start the conversation"
              lead="Tell us what you would like to back and at what level. A member of the programme team will follow up within two working days."
            />

            <div className="mt-10 space-y-4">
              {[
                {
                  t: "Traceable to named businesses",
                  d: "You know which entrepreneurs your funding reached, in which cluster.",
                },
                {
                  t: "Quarterly impact reporting",
                  d: "Revenue, jobs created, businesses still operating — reported from the programme database, not estimated.",
                },
                {
                  t: "Access to the cohort",
                  d: "Mentor placements, judging seats and first sight of investment-ready businesses.",
                },
              ].map((item) => (
                <div key={item.t} className="rounded-2xl bg-lime-50 p-6">
                  <p className="font-display font-bold text-ink-900">{item.t}</p>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-500">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-ink-900/8 bg-white p-8 sm:p-10">
            <SponsorForm />
          </div>
        </div>
      </Section>
    </>
  );
}
