import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ClusterCards } from "@/components/home/ClusterCards";
import { Button } from "@/components/ui/Button";
import { Section, SectionHead } from "@/components/ui/Section";
import { CLUSTERS } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Programme Clusters",
  description:
    "Four thematic clusters: Creative Craft, Agric & Agri-businesses, Fisheries & Aquaculture, and Tech & Innovation — 25 entrepreneurs in each.",
};

export default function ClustersPage() {
  return (
    <>
      <PageHero
        eyebrow="Four Clusters"
        crumbs={[{ label: "Clusters", href: "/clusters" }]}
        title={
          <>
            Four high-impact sectors.
            <br />
            <span className="text-lime-400">Twenty-five seats in each.</span>
          </>
        }
        lead="The incubator is built around the sectors that actually drive the Shama economy, so training, mentors and facilitators are matched to how your industry makes money."
      image="/brand/photo-investor-readiness.webp"
      />

      <Section>
        <ClusterCards />
      </Section>

      <Section className="bg-lime-50/60">
        <SectionHead
          eyebrow="Not sure where you fit?"
          title="Pick the cluster closest to how you earn revenue"
          lead="If your business spans two clusters, choose the one your customers pay you for today. The programme team can move you during onboarding if the fit is better elsewhere."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {CLUSTERS.map((cluster) => (
            <div
              key={cluster.slug}
              className="rounded-3xl border border-ink-900/8 bg-white p-7"
              style={{ borderTopColor: cluster.accent, borderTopWidth: 3 }}
            >
              <h3 className="font-display text-lg text-ink-900">{cluster.name}</h3>
              <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.14em] text-ink-500 uppercase">
                Eligible business areas
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {cluster.focus.map((f) => (
                  <li
                    key={f}
                    className="rounded-full bg-ink-900/[0.04] px-3 py-1.5 text-[0.8rem] text-ink-500"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Button href={`/clusters/${cluster.slug}`} variant="outline" size="sm" className="mt-6">
                Cluster detail
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
