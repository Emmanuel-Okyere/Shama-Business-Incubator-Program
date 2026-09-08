import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BadgeCheck, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { CLUSTERS, clusterBySlug } from "@/lib/programme";

const DB_KEY = {
  "creative-craft": "CREATIVE_CRAFT",
  "agric-agribusiness": "AGRIC_AGRIBUSINESS",
  "fisheries-aquaculture": "FISHERIES_AQUACULTURE",
  "tech-innovation": "TECH_INNOVATION",
} as const;

export function generateStaticParams() {
  return CLUSTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cluster = clusterBySlug(slug);
  if (!cluster) return {};
  return {
    title: cluster.name,
    description: cluster.blurb,
  };
}

export default async function ClusterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cluster = clusterBySlug(slug);
  if (!cluster) notFound();

  const key = DB_KEY[cluster.slug];

  const participants = await safeQuery(
    () =>
      prisma.participant.findMany({
        where: { cluster: key, publicProfile: true },
        include: { application: true, user: true },
        take: 6,
      }),
    [],
  );

  const mentors = await safeQuery(
    () =>
      prisma.mentor.findMany({
        where: { published: true, clusters: { has: key } },
        take: 4,
      }),
    [],
  );

  const others = CLUSTERS.filter((c) => c.slug !== cluster.slug);

  return (
    <>
      <PageHero
        eyebrow={`${cluster.seats} seats`}
        accent={cluster.accent}
        crumbs={[
          { label: "Clusters", href: "/clusters" },
          { label: cluster.name, href: `/clusters/${cluster.slug}` },
        ]}
        title={cluster.name}
        lead={cluster.blurb}
        image={cluster.banner}
      >
        <Button href={`/apply?cluster=${cluster.slug}`} size="lg">
          Apply to this cluster
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Eligible business areas" title="Is your business a fit?" />
            <ul className="mt-8 space-y-3">
              {cluster.focus.map((f, i) => (
                <Reveal key={f} delay={i * 60} as="li">
                  <div className="flex items-center gap-4 rounded-2xl border border-ink-900/8 bg-white px-6 py-4">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cluster.accent }}
                    />
                    <span className="font-medium text-ink-900">{f}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead eyebrow="Training focus" title="What this cluster is taught" />
            <ul className="mt-8 space-y-4">
              {cluster.training.map((t, i) => (
                <Reveal key={t} delay={i * 60} as="li">
                  <div className="flex gap-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-lime-600" />
                    <p className="leading-relaxed text-ink-500">{t}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 rounded-3xl p-8" style={{ backgroundColor: cluster.tint }}>
              <Users className="h-6 w-6" style={{ color: cluster.accent }} />
              <p className="mt-4 font-display text-lg text-ink-900">
                {cluster.seats} entrepreneurs, one cohort
              </p>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-500">
                Top five from this cluster progress to the Ultimate Pitch and compete for grant
                funding of up to GHS 50,000.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {participants.length > 0 && (
        <Section className="bg-lime-50/60">
          <SectionHead eyebrow="In this cluster" title="Participating businesses" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((p) => (
              <div key={p.id} className="rounded-3xl border border-ink-900/8 bg-white p-6">
                <h3 className="font-display text-lg text-ink-900">
                  {p.application.businessName ?? p.user.fullName}
                </h3>
                <p className="mt-1 text-sm text-ink-500">{p.user.fullName}</p>
                <p className="mt-3 line-clamp-3 text-[0.88rem] leading-relaxed text-ink-500">
                  {p.application.businessDescription}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {mentors.length > 0 && (
        <Section>
          <SectionHead eyebrow="Facilitators & mentors" title="Who you will learn from" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((m) => (
              <div key={m.id} className="rounded-3xl border border-ink-900/8 bg-white p-6">
                <h3 className="font-display text-[1.05rem] text-ink-900">{m.fullName}</h3>
                <p className="mt-1 text-sm text-lime-700">{m.position}</p>
                <p className="mt-0.5 text-sm text-ink-500">{m.organisation}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section className="bg-ink-950 text-white">
        <SectionHead tone="dark" eyebrow="Other clusters" title="Explore the rest of the cohort" />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/clusters/${other.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-lime-400/40 hover:bg-lime-500/[0.07]"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white/5">
                <Image src={other.art} alt="" fill sizes="96px" className="object-cover object-center" />
              </div>
              <h3 className="mt-5 font-display text-lg">{other.name}</h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300">
                View cluster
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
