import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { CLUSTERS, PROGRAMME } from "@/lib/programme";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Entrepreneurs",
  description:
    "Meet the businesses in the Shama Business Incubator cohort — by cluster, location and stage. Profiles are published with founder consent.",
};

const DB_KEY = {
  "creative-craft": "CREATIVE_CRAFT",
  "agric-agribusiness": "AGRIC_AGRIBUSINESS",
  "fisheries-aquaculture": "FISHERIES_AQUACULTURE",
  "tech-innovation": "TECH_INNOVATION",
} as const;

const LABEL: Record<string, string> = Object.fromEntries(
  CLUSTERS.map((c) => [DB_KEY[c.slug], c.name]),
);
const ACCENT: Record<string, string> = Object.fromEntries(
  CLUSTERS.map((c) => [DB_KEY[c.slug], c.accent]),
);

export default async function EntrepreneursPage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string }>;
}) {
  const { cluster } = await searchParams;
  const active = CLUSTERS.find((c) => c.slug === cluster);

  const participants = await safeQuery(
    () =>
      prisma.participant.findMany({
        where: {
          publicProfile: true,
          ...(active ? { cluster: DB_KEY[active.slug] } : {}),
        },
        include: { application: true, user: true },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  return (
    <>
      <PageHero
        eyebrow="Entrepreneurs"
        crumbs={[{ label: "Entrepreneurs", href: "/entrepreneurs" }]}
        title="Meet the businesses"
        lead={`The public directory of ${PROGRAMME.cohort}. Every profile is published only after the founder has consented to it.`}
      image="/brand/photo-branding.webp"
        imagePosition="center"
      />

      <Section>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/entrepreneurs"
            className={
              !active
                ? "rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-white"
                : "rounded-full border border-ink-900/12 px-5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:border-lime-500 hover:text-lime-700"
            }
          >
            All clusters
          </Link>
          {CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={`/entrepreneurs?cluster=${c.slug}`}
              className={
                active?.slug === c.slug
                  ? "rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-white"
                  : "rounded-full border border-ink-900/12 px-5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:border-lime-500 hover:text-lime-700"
              }
            >
              {c.name}
            </Link>
          ))}
        </div>

        {participants.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-ink-900/15 bg-lime-50/60 px-8 py-20 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-lime-600">
              <Search className="h-6 w-6" />
            </span>
            <h2 className="mt-6 font-display text-2xl text-ink-900">
              The directory opens once the cohort is selected
            </h2>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink-500">
              {active
                ? `No ${active.name} businesses have published a profile yet.`
                : "Businesses appear here after selection and onboarding, once each founder has approved their public profile."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/apply">
                Apply to the cohort
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/clusters" variant="outline">
                Explore the clusters
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((p, i) => (
              <Reveal key={p.id} delay={i * 50} as="article">
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition-shadow hover:shadow-card">
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: ACCENT[p.cluster] }}
                  />
                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center gap-4">
                      {p.photoUrl ? (
                        <Image
                          src={p.photoUrl}
                          alt={p.user.fullName}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-lime-500 font-display font-bold text-ink-950">
                          {initials(p.application.businessName ?? p.user.fullName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[1.05rem] text-ink-900">
                          {p.application.businessName ?? p.user.fullName}
                        </h3>
                        <p className="truncate text-sm text-ink-500">{p.user.fullName}</p>
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-4 flex-1 text-[0.9rem] leading-relaxed text-ink-500">
                      {p.application.businessDescription}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink-900/8 pt-5">
                      <span
                        className="rounded-full px-3 py-1 text-[0.72rem] font-semibold text-white"
                        style={{ backgroundColor: ACCENT[p.cluster] }}
                      >
                        {LABEL[p.cluster]}
                      </span>
                      {p.application.businessLocation && (
                        <span className="inline-flex items-center gap-1 text-[0.78rem] text-ink-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {p.application.businessLocation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section className="bg-lime-500 py-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <SectionHead title="Want your business in this directory?" />
            <p className="mt-2 text-ink-950/70">
              It starts with an application. Free, and open to ages {PROGRAMME.ageRange}.
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
