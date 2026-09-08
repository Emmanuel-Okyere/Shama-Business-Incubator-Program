import type { Metadata } from "next";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Information sessions, bootcamp sessions, pitch competitions, graduation, showcases and quarterly Growth Labs.",
};

export const revalidate = 300;

const KINDS = [
  "Information Session",
  "Bootcamp Session",
  "Pitch Competition",
  "Graduation",
  "Business Showcase",
  "Networking",
  "Growth Lab",
  "Annual Cohort Exit",
];

export default async function EventsPage() {
  const now = new Date();

  const upcoming = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { status: "PUBLISHED", startsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
      }),
    [],
  );

  const past = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { status: "PUBLISHED", startsAt: { lt: now } },
        orderBy: { startsAt: "desc" },
        take: 6,
      }),
    [],
  );

  return (
    <>
      <PageHero
        eyebrow="Events"
        crumbs={[{ label: "Events", href: "/events" }]}
        title="Where the programme happens"
        lead="Information sessions across the constituency, bootcamp sessions, pitch competitions, graduation and the quarterly Growth Labs."
      image="/brand/photo-bootcamp.webp"
        imagePosition="center"
      />

      <Section>
        <SectionHead eyebrow="Upcoming" title="What is coming up" />

        {upcoming.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-ink-900/15 bg-lime-50/60 px-8 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-lime-600">
              <CalendarDays className="h-6 w-6" />
            </span>
            <h3 className="mt-6 font-display text-xl text-ink-900">No events scheduled yet</h3>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
              The programme calendar is published here as dates are confirmed. Event types include:
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {KINDS.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-white px-4 py-2 text-[0.8rem] font-medium text-ink-500"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <ul className="mt-12 space-y-4">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 60} as="li">
                <article className="grid gap-6 rounded-3xl border border-ink-900/8 bg-white p-7 transition-shadow hover:shadow-lift sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                  <div className="rounded-2xl bg-lime-500 px-4 py-4 text-center text-ink-950">
                    <p className="font-display text-2xl leading-none font-bold">
                      {new Date(event.startsAt).getDate()}
                    </p>
                    <p className="mt-1 text-[0.7rem] font-semibold tracking-wide uppercase">
                      {new Date(event.startsAt).toLocaleDateString("en-GB", { month: "short" })}
                    </p>
                  </div>

                  <div>
                    <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                      {event.kind}
                    </span>
                    <h3 className="mt-2 font-display text-xl text-ink-900">{event.title}</h3>
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-500">
                      {event.description}
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-4 text-[0.82rem] text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDateTime(event.startsAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    </p>
                  </div>

                  {event.registerUrl && (
                    <Button href={event.registerUrl} className="shrink-0">
                      <Ticket className="h-4 w-4" />
                      Register
                    </Button>
                  )}
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </Section>

      {past.length > 0 && (
        <Section className="bg-lime-50/60">
          <SectionHead eyebrow="Past" title="Recently held" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <div key={event.id} className="rounded-3xl border border-ink-900/8 bg-white p-6">
                <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink-500 uppercase">
                  {event.kind}
                </span>
                <h3 className="mt-2 font-display text-[1.05rem] leading-snug text-ink-900">
                  {event.title}
                </h3>
                <p className="mt-2 text-[0.82rem] text-ink-500">
                  {formatDate(event.startsAt)} · {event.location}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
