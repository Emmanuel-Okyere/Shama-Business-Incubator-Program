import Image from "next/image";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { PROGRAMME, ghs } from "@/lib/programme";

// Captions describe the trade each portrait actually shows rather than
// forcing a cluster label onto it — the deck supplies three cut-outs, and the
// programme has four clusters.
const CUTOUTS = [
  { src: "/brand/founder-craft.webp", alt: "Entrepreneur in fashion and craft", trade: "Fashion & craft" },
  { src: "/brand/founder-artisan.webp", alt: "Entrepreneur in trades and repair", trade: "Trades & making" },
  { src: "/brand/founder-agric.webp", alt: "Entrepreneur in agribusiness", trade: "Farming & agro" },
];

export function Hero({
  applicationsOpen,
  closeDate,
  entrepreneurs,
  funding,
}: {
  applicationsOpen: boolean;
  closeDate: string;
  entrepreneurs: number;
  funding: number;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute top-1/2 -left-40 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-lime-500/14 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-lime-300/10 blur-[100px]"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:py-24">
          {/* ---------------------------------------------------- copy */}
          <div className="animate-rise">
            <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-lime-400/25 bg-lime-500/10 py-1.5 pr-4 pl-1.5 text-xs font-medium text-lime-200">
              <span className="shrink-0 rounded-full bg-lime-500 px-2.5 py-1 text-[0.65rem] font-bold tracking-wider whitespace-nowrap text-ink-950 uppercase">
                {PROGRAMME.cohort}
              </span>
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Shama Constituency · Western Region</span>
            </div>

            <h1 className="mt-7 font-display text-[2.75rem] leading-[0.98] font-bold tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Ignite Ideas.
              <br />
              <span className="text-lime-400">Fund Potential.</span>
              <br />
              Scale Impact.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/65">
              A structured entrepreneurship programme that identifies, trains, mentors and{" "}
              <span className="font-medium text-white">funds</span> high-potential young
              entrepreneurs in Shama — from raw idea to investment-ready business in one cohort.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {applicationsOpen ? (
                <>
                  <Button href="/apply" size="lg">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href="/how-it-works"
                    size="lg"
                    className="border border-white/20 bg-white/5 text-white hover:border-lime-400/50 hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/interest" size="lg">
                    Join the interest list
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href="/how-it-works"
                    size="lg"
                    className="border border-white/20 bg-white/5 text-white hover:border-lime-400/50 hover:bg-white/10"
                  >
                    See how it works
                  </Button>
                </>
              )}
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-white/45">
              <Sparkles className="h-4 w-4 text-lime-400" />
              {applicationsOpen ? (
                <>
                  Applications close {closeDate}. Free to apply — ages {PROGRAMME.ageRange}.
                </>
              ) : (
                <>Applications for {PROGRAMME.cohort} are currently closed.</>
              )}
            </p>
          </div>

          {/* ------------------------------------------------- collage */}
          <div className="relative">
            <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
              {CUTOUTS.map((person, i) => (
                <figure
                  key={person.src}
                  style={{ animationDelay: `${140 + i * 110}ms` }}
                  className="animate-rise group relative overflow-hidden rounded-t-[2rem] rounded-b-xl bg-gradient-to-b from-lime-500/25 to-lime-700/50 pt-6 ring-1 ring-white/10"
                >
                  <Image
                    src={person.src}
                    alt={person.alt}
                    width={560}
                    height={800}
                    priority={i === 0}
                    sizes="(max-width: 1024px) 33vw, 180px"
                    className="h-full w-full object-cover object-top drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent px-3 pt-8 pb-3 text-[0.63rem] leading-tight font-semibold tracking-wide text-lime-200 uppercase">
                    {person.trade}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* founder badge */}
            <div className="animate-rise mt-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm [animation-delay:520ms]">
              <Image
                src="/brand/hon-emelia-arthur.webp"
                alt={PROGRAMME.initiator}
                width={160}
                height={160}
                className="h-14 w-14 shrink-0 rounded-full bg-lime-500/20 object-cover object-top"
              />
              <div className="min-w-0">
                <p className="font-display text-sm font-bold">An initiative by {PROGRAMME.initiator}</p>
                <p className="mt-0.5 text-[0.72rem] leading-snug text-white/50">
                  {PROGRAMME.initiatorRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ------------------------------------------------ figure strip */}
      <div className="relative border-t border-white/10 bg-ink-950/60">
        <Container>
          <dl className="grid grid-cols-2 divide-white/8 sm:grid-cols-4 sm:divide-x">
            {[
              { k: `${entrepreneurs}`, v: "Entrepreneurs trained" },
              { k: "4", v: "Business clusters" },
              { k: "8", v: "Week bootcamp" },
              { k: ghs(funding), v: "Grant funding pool" },
            ].map((item) => (
              <div key={item.v} className="px-2 py-7 text-center sm:px-6">
                <dt className="font-display text-2xl font-bold text-lime-400 sm:text-3xl">
                  {item.k}
                </dt>
                <dd className="mt-1.5 text-[0.72rem] tracking-wide text-white/45 uppercase">
                  {item.v}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
