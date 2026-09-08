import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CalendarCheck, Target, UserCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { MentorForm } from "@/components/site/forms/MentorForm";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Every participant is matched one-to-one with an experienced mentor by cluster, industry and business need. Volunteer as a mentor for the Shama Business Incubator.",
};

// Figures here are admin-editable; revalidatePath refreshes them on save, and
// this is the backstop if the data changes outside the admin UI.
export const revalidate = 300;

const MATCHING = [
  { icon: UserCheck, t: "Matched, not assigned at random", d: "Pairing considers cluster, industry, business needs, mentor expertise and what the participant says they are stuck on. Administrators can override any match." },
  { icon: CalendarCheck, t: "Tracked check-ins", d: "Each session records date, duration, topics discussed, challenges raised, advice and action points, and the next meeting date." },
  { icon: Target, t: "Accountable to outcomes", d: "Mentors submit progress reports. Overdue reports surface on the programme dashboard so nobody quietly falls off." },
];

export default async function MentorshipPage() {
  const mentors = await safeQuery(
    () => prisma.mentor.findMany({ where: { published: true }, orderBy: { fullName: "asc" } }),
    [],
  );

  return (
    <>
      <PageHero
        eyebrow="Mentorship"
        crumbs={[{ label: "Mentorship", href: "/mentorship" }]}
        title={
          <>
            Someone in the room who has
            <br />
            <span className="text-lime-400">already done it.</span>
          </>
        }
        lead="Every one of the 100 participants is paired with an experienced mentor for the length of the programme — and keeps that relationship after graduation."
        image="/brand/photo-mentorship.webp"
        imagePosition="center"
      >
        <Button href="#become-a-mentor" size="lg">
          Become a mentor
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHero>

      <Section>
        <SectionHead
          eyebrow="How Matching Works"
          title="Mentorship that is managed, not left to chance"
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {MATCHING.map((item, i) => (
            <Reveal key={item.t} delay={i * 80}>
              <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-100 text-lime-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-lg leading-snug text-ink-900">{item.t}</h3>
                <p className="mt-3 leading-relaxed text-ink-500">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {mentors.length > 0 && (
        <Section className="bg-lime-50/60">
          <SectionHead eyebrow="The Mentor Pool" title="Mentors and facilitators" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((m, i) => (
              <Reveal key={m.id} delay={i * 50}>
                <div className="h-full rounded-3xl border border-ink-900/8 bg-white p-7">
                  {m.photoUrl ? (
                    <Image
                      src={m.photoUrl}
                      alt={m.fullName}
                      width={80}
                      height={80}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-lime-500 font-display text-lg font-bold text-ink-950">
                      {initials(m.fullName)}
                    </span>
                  )}
                  <h3 className="mt-5 font-display text-[1.05rem] leading-snug text-ink-900">
                    {m.fullName}
                  </h3>
                  {m.position && <p className="mt-1 text-sm text-lime-700">{m.position}</p>}
                  {m.organisation && <p className="text-sm text-ink-500">{m.organisation}</p>}
                  {m.expertise.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {m.expertise.slice(0, 3).map((e) => (
                        <li
                          key={e}
                          className="rounded-full bg-ink-900/[0.04] px-2.5 py-1 text-[0.72rem] text-ink-500"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section id="become-a-mentor" className="bg-ink-950 text-white">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead
              tone="dark"
              eyebrow="Volunteer"
              title="Give three hours a month. Change a business."
              lead="We are recruiting mentors across all four clusters. You do not need to be from Shama — you need to have built something and be willing to be honest about how."
            />

            <div className="mt-10 space-y-3">
              {[
                "Two to three hours per month for the programme duration",
                "One-on-one sessions with one to three mentees",
                "Short structured reports after each session",
                "Optional: judge the internal or Ultimate Pitch",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-[0.95rem] text-white/70"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 sm:p-10">
            <MentorForm />
          </div>
        </div>
      </Section>
    </>
  );
}
