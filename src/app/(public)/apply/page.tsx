import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  IdCard,
  Save,
  Smartphone,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { CLUSTERS, PROGRAMME, ghs, TOTAL_FUNDING } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to the Shama Business Incubator. Free to apply, open to entrepreneurs aged 18–35 in the Shama Constituency.",
};

// Figures here are admin-editable; revalidatePath refreshes them on save, and
// this is the backstop if the data changes outside the admin UI.
export const revalidate = 300;

const ELIGIBILITY = [
  `Aged ${PROGRAMME.ageRange} at the time of application`,
  "Living in, or running a business within, the Shama Constituency",
  "Operating in one of the four programme clusters",
  "An idea, an early-stage venture or an operating business — all are welcome",
  "Able to attend in-person bootcamp sessions in Shama",
];

const PREPARE = [
  { icon: IdCard, t: "Identification", d: "Ghana Card, passport or voter ID." },
  { icon: FileText, t: "Business documents", d: "Registration certificate if you have one — it is not required to apply." },
  { icon: FileText, t: "Pitch deck or business plan", d: "Optional, but it strengthens your application." },
  { icon: FileText, t: "Product images", d: "Photos of what you make or sell." },
];

export default async function ApplyPage() {
  const settings = await getSettings();
  if (settings.applications_open !== "true") redirect("/interest");

  return (
    <>
      <PageHero
        eyebrow="Apply Now"
        crumbs={[{ label: "Apply", href: "/apply" }]}
        title={
          <>
            Applications are open
            <br />
            <span className="text-lime-400">for {PROGRAMME.cohort}.</span>
          </>
        }
        lead={`100 seats across four clusters, an 8-week bootcamp, one-on-one mentorship and ${ghs(TOTAL_FUNDING)} in grant funding. Free to apply.`}
      image="/brand/photo-bootcamp.webp"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/apply/start" size="lg">
            Start your application
            <ArrowRight className="h-4 w-4" />
          </Button>
          <span className="inline-flex items-center gap-2 text-sm text-white/50">
            <CalendarClock className="h-4 w-4 text-lime-400" />
            Closes {formatDate(settings.applications_close_date)}
          </span>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Eligibility" title="Who can apply" />
            <ul className="mt-9 space-y-3">
              {ELIGIBILITY.map((item, i) => (
                <Reveal key={item} delay={i * 55} as="li">
                  <div className="flex gap-4 rounded-2xl border border-ink-900/8 bg-white px-6 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lime-600" />
                    <span className="leading-relaxed text-ink-500">{item}</span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 rounded-3xl bg-lime-50 p-8">
              <h3 className="font-display text-lg text-ink-900">Pick your cluster</h3>
              <p className="mt-2 text-[0.92rem] text-ink-500">
                Choose the one your customers pay you for today.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CLUSTERS.map((c) => (
                  <span
                    key={c.slug}
                    className="rounded-full bg-white px-4 py-2 text-[0.85rem] font-medium text-ink-900"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionHead eyebrow="Before you start" title="What to have ready" />
            <ul className="mt-9 grid gap-4 sm:grid-cols-2">
              {PREPARE.map((item, i) => (
                <Reveal key={item.t} delay={i * 60} as="li">
                  <div className="h-full rounded-2xl border border-ink-900/8 bg-white p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-100 text-lime-700">
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-4 font-display font-bold text-ink-900">{item.t}</p>
                    <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-500">{item.d}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-ink-950 p-6 text-white">
                <Save className="h-5 w-5 text-lime-400" />
                <p className="mt-4 font-display font-bold">Save and return</p>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-white/55">
                  Your progress is saved at every step. Finish it over several sittings if you need
                  to.
                </p>
              </div>
              <div className="rounded-2xl bg-lime-500 p-6 text-ink-950">
                <Smartphone className="h-5 w-5" />
                <p className="mt-4 font-display font-bold">SMS updates</p>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-950/70">
                  You get a text when your application is received and at every status change after
                  that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-lime-50 px-8 py-10 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl text-ink-900">Ready? It takes about 25 minutes.</h3>
            <p className="mt-2 text-ink-500">
              You will create an account first so you can save and come back.
            </p>
          </div>
          <Button href="/apply/start" size="lg" className="shrink-0">
            Start your application
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>
    </>
  );
}
