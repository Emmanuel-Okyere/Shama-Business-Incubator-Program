import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fish, Leaf, Palette, Cpu } from "lucide-react";
import { CLUSTERS } from "@/lib/programme";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = {
  craft: Palette,
  agric: Leaf,
  fish: Fish,
  tech: Cpu,
} as const;

export function ClusterCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CLUSTERS.map((cluster, i) => {
        const Icon = ICONS[cluster.icon];
        return (
          <Reveal key={cluster.slug} delay={i * 90} as="article">
            <Link
              href={`/clusters/${cluster.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-card"
            >
              <div
                className="relative h-44 overflow-hidden"
                style={{ backgroundColor: cluster.tint }}
              >
                <Image
                  src={cluster.art}
                  alt=""
                  width={560}
                  height={420}
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute top-4 left-4 grid h-10 w-10 place-items-center rounded-xl text-white shadow-lg"
                  style={{ backgroundColor: cluster.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="absolute right-4 bottom-4 rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-semibold text-ink-900">
                  {cluster.seats} seats
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg leading-snug text-ink-900">{cluster.name}</h3>
                <p className="mt-2.5 flex-1 text-[0.9rem] leading-relaxed text-ink-500">
                  {cluster.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-700">
                  Explore cluster
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>

              <span
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: cluster.accent }}
              />
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
