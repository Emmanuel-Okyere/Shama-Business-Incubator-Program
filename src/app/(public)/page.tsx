import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Handshake,
  TrendingDown,
  Users,
} from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { Pipeline } from "@/components/home/Pipeline";
import { ClusterCards } from "@/components/home/ClusterCards";
import { FundingTiers } from "@/components/site/FundingTiers";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { getSettings, num } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import {
  BEYOND_INCUBATOR,
  EXPECTED_IMPACT,
  JOURNEY,
  OPPORTUNITY,
  PROGRAMME,
  VALUE_PROPS,
  ghs,
} from "@/lib/programme";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getSettings();
  const open = settings.applications_open === "true";

  const posts = await safeQuery(
    () =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    [],
  );

  const events = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
      }),
    [],
  );

  const partners = await safeQuery(
    () => prisma.partner.findMany({ orderBy: { order: "asc" } }),
    [],
  );

  return (
    <>
      <Hero
        applicationsOpen={open}
        closeDate={formatDate(settings.applications_close_date)}
        entrepreneurs={num(settings, "stat_entrepreneurs")}
        funding={num(settings, "stat_funding")}
      />

      {/* ------------------------------------------ what is the incubator */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <SectionHead
              eyebrow="What is the Incubator?"
              title={
                <>
                  A clear, practical pathway from idea to{" "}
                  <span className="text-lime-600">sustainable business</span>.
                </>
              }
              lead="The Shama Business Incubator identifies, develops and funds high-potential young entrepreneurs within the Shama Constituency — combining hands-on training, mentorship and real access to capital."
            />

            <p className="mt-6 max-w-2xl leading-relaxed text-ink-500">
              Through an integrated approach — <strong className="text-ink-900">Ignite, Fund,
              Scale</strong> — the programme equips participants aged {PROGRAMME.ageRange} with
              essential business and financial skills, supports them with expert guidance, and
              invests in viable ideas through a competitive pitch process.
            </p>

            <p className="mt-4 max-w-2xl leading-relaxed text-ink-500">
              What sets it apart is its focus on real outcomes: not just training entrepreneurs, but
              building resilient businesses that create jobs, drive innovation and contribute to the
              economic development of Shama.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/about" variant="dark">
                About the programme
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/programme-journey" variant="outline">
                See the full journey
              </Button>
            </div>
          </div>

          {/* the opportunity */}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-8 text-white sm:p-10">
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-brandred/15 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.14em] text-red-300 uppercase">
                  <TrendingDown className="h-3.5 w-3.5" />
                  The Opportunity
                </span>

                <h3 className="mt-6 font-display text-2xl leading-snug">
                  Strong entrepreneurial interest. Low business survival rates.
                </h3>

                <ul className="mt-7 space-y-4">
                  {OPPORTUNITY.map((item) => (
                    <li key={item} className="flex gap-3.5 text-[0.95rem] leading-relaxed text-white/65">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-5">
                  <p className="text-[0.9rem] leading-relaxed text-lime-100">
                    The incubator closes those three gaps at once — capital, structure and network —
                    inside a single {settings.stat_bootcamp_weeks}-week programme.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------- how it works */}
      <Section className="bg-lime-50/60">
        <SectionHead
          eyebrow="How It Works"
          title="An end-to-end entrepreneurial pipeline"
          lead="Six stages, one continuous journey. Select a stage to see what happens inside it."
        />
        <div className="mt-14">
          <Pipeline />
        </div>
      </Section>

      {/* --------------------------------------------------- the clusters */}
      <Section>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHead
            eyebrow="Four Clusters"
            title="Focused support, tailored to your industry"
            lead="25 participants in each cluster receive relevant, practical support built around how their sector actually makes money."
          />
          <Button href="/clusters" variant="outline" className="shrink-0">
            All clusters
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-12">
          <ClusterCards />
        </div>
      </Section>

      {/* -------------------------------------------- programme journey */}
      <Section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="grain absolute inset-0 opacity-[0.35]" aria-hidden />
        <div className="relative">
          <SectionHead
            tone="dark"
            eyebrow="Programme Journey"
            title="Eight stages from application to growth"
            lead="Every participant moves through the same tracked path — and can see exactly where they stand at any time."
          />

          <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((step, i) => (
              <Reveal key={step.stage} delay={i * 60} as="li">
                <div className="group h-full bg-ink-950 p-7 transition-colors duration-300 hover:bg-ink-900">
                  <span className="font-display text-4xl font-bold text-white/10 transition-colors duration-300 group-hover:text-lime-400/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg text-white">{step.stage}</h3>
                  <p className="mt-2.5 text-[0.88rem] leading-relaxed text-white/50">
                    {step.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ------------------------------------------------ value proposition */}
      <Section>
        <SectionHead
          eyebrow="Value Proposition"
          title="A holistic support system — not just a training course"
          lead="Entrepreneurs are equipped to build sustainable, competitive businesses, then backed with the capital to do it."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {VALUE_PROPS.map((prop, i) => (
            <Reveal key={prop.title} delay={i * 80} as="article">
              <div className="flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-ink-900/8 bg-white p-5 transition-shadow duration-300 hover:shadow-card sm:flex-row sm:p-6">
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-lime-100 sm:h-auto sm:w-44">
                  <Image
                    src={prop.photo}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 176px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-ink-900">{prop.title}</h3>
                  <p className="mt-2 text-[0.9rem] text-ink-500">{prop.intro}</p>
                  <ul className="mt-4 space-y-2.5">
                    {prop.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[0.9rem] leading-snug text-ink-500">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------- programme numbers */}
      <Section className="bg-lime-500">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="bracket-frame inline-flex">
              <span className="rounded-md bg-ink-950 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-lime-300 uppercase">
                Programme Numbers
              </span>
            </span>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] text-ink-950 sm:text-4xl lg:text-[2.9rem]">
              The cohort, in figures.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-950/70">
              Designed to be trackable, not aspirational. Every number below is maintained from the
              programme database as the cohort progresses.
            </p>
            <Button href="/impact" variant="dark" className="mt-8">
              See live impact
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink-950/10 sm:grid-cols-3">
            {[
              { label: "Entrepreneurs", value: num(settings, "stat_entrepreneurs") },
              { label: "Business clusters", value: num(settings, "stat_clusters") },
              { label: "Investment-ready", value: num(settings, "stat_investment_ready") },
              { label: "Funded businesses", value: num(settings, "stat_funded") },
              {
                label: "Grant funding",
                value: num(settings, "stat_funding"),
                prefix: "GHS ",
              },
              { label: "Week bootcamp", value: num(settings, "stat_bootcamp_weeks") },
            ].map((stat) => (
              <div key={stat.label} className="bg-lime-500 px-5 py-8 text-center">
                <dt className="font-display text-[1.75rem] leading-none font-bold text-ink-950 sm:text-[2rem]">
                  <Counter to={stat.value} prefix={stat.prefix} />
                </dt>
                <dd className="mt-2.5 text-[0.72rem] leading-tight font-medium tracking-wide text-ink-950/60 uppercase">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ------------------------------------------------------- funding */}
      <Section>
        <SectionHead
          eyebrow="Funding Model"
          title={
            <>
              {ghs(num(settings, "stat_funding"))} in grant capital,{" "}
              <span className="text-lime-600">allocated on performance</span>.
            </>
          }
          lead="Grant funding — not a loan — is awarded to the 20 finalists based on how they perform at the Ultimate Pitch."
        />
        <div className="mt-14">
          <FundingTiers />
        </div>
      </Section>

      {/* --------------------------------------- entrepreneurs & mentors */}
      <Section className="bg-lime-50/60">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Link
              href="/entrepreneurs"
              className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink-950 p-8 text-white sm:p-10"
            >
              <Image
                src="/brand/photo-bootcamp.webp"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20" />
              <div className="relative">
                <Users className="h-7 w-7 text-lime-400" />
                <h3 className="mt-5 font-display text-2xl sm:text-3xl">Meet the entrepreneurs</h3>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-white/60">
                  Browse the businesses in the cohort — by cluster, location and stage. Every profile
                  is published with the founder&apos;s consent.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300">
                  Open the directory
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={90}>
            <Link
              href="/mentorship"
              className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl border border-ink-900/8 bg-white p-8 sm:p-10"
            >
              <Image
                src="/brand/photo-mentorship.webp"
                alt=""
                width={900}
                height={900}
                className="absolute top-0 right-0 h-48 w-48 rounded-bl-[4rem] object-cover"
              />
              <div className="relative">
                <Handshake className="h-7 w-7 text-lime-600" />
                <h3 className="mt-5 font-display text-2xl text-ink-900 sm:text-3xl">
                  Mentors &amp; facilitators
                </h3>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
                  Practitioners who have built businesses in these sectors, matched one-to-one by
                  cluster and business need. We are recruiting for {PROGRAMME.cohort}.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-700">
                  Become a mentor
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------- partners */}
      {partners.length > 0 && (
        <Section className="py-16">
          <p className="text-center text-[0.72rem] font-semibold tracking-[0.18em] text-ink-500 uppercase">
            Backed by partners and sponsors
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {partners.map((partner) => (
              <span
                key={partner.id}
                className="font-display text-lg font-bold text-ink-900/25 transition-colors hover:text-ink-900/60"
              >
                {partner.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* --------------------------------------------------------- impact */}
      <Section className="bg-ink-950 text-white">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHead
              tone="dark"
              eyebrow="Expected Impact"
              title="Tangible, trackable transformation — not participation numbers."
              lead="The programme is measured on what happens to the businesses, in the constituency, after the funding lands."
            />
            <Button href="/impact" className="mt-9">
              Impact dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <ul className="space-y-3">
            {EXPECTED_IMPACT.map((item, i) => (
              <Reveal key={item} delay={i * 70} as="li">
                <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 transition-colors hover:border-lime-400/30 hover:bg-lime-500/[0.07]">
                  <span className="font-display text-sm font-bold text-lime-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.98rem] font-medium">{item}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="mt-20 grid gap-5 border-t border-white/10 pt-14 lg:grid-cols-3">
          {BEYOND_INCUBATOR.map((block, i) => (
            <Reveal key={block.title} delay={i * 80} as="article">
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <span className="font-display text-xs font-bold tracking-[0.16em] text-lime-400">
                  {block.n}
                </span>
                <h3 className="mt-3 font-display text-xl">{block.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[0.88rem] leading-relaxed text-white/55">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------ latest updates */}
      {(posts.length > 0 || events.length > 0) && (
        <Section>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHead eyebrow="Latest Updates" title="News, events and programme milestones" />
            <Button href="/news" variant="outline" className="shrink-0">
              All updates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 80} as="article">
                <Link
                  href={`/news/${post.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                    {post.category}
                  </span>
                  <h3 className="mt-3 font-display text-lg leading-snug text-ink-900">
                    {post.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-ink-500">
                    {post.excerpt}
                  </p>
                  <span className="mt-6 text-xs text-ink-500/70">
                    {formatDate(post.publishedAt)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          {events.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 rounded-2xl bg-lime-50 p-5"
                >
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-lime-600" />
                  <div>
                    <p className="font-display text-[0.95rem] leading-snug font-bold text-ink-900">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatDate(event.startsAt)} · {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ---------------------------------------------- become a partner */}
      <Section className="pb-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-lime-700 px-8 py-14 text-white sm:px-14">
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Eyebrow tone="dark">Become a Partner</Eyebrow>
              <h2 className="mt-6 font-display text-3xl leading-[1.12] sm:text-4xl">
                Fund a cluster. Change a constituency.
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-white/70">
                Corporate partners, institutions, and sons and daughters of Shama are backing this
                cohort — from {ghs(100000)} Supporter through to Title Sponsor. Your support is
                traceable to named businesses and reported on quarterly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/partners#become-a-partner" size="lg">
                  Sponsorship packages
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  href="/contact"
                  size="lg"
                  className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
                  Talk to the team
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {["Supporter", "Growth Partner", "Strategic Partner", "Title Sponsor"].map(
                (level, i) => (
                  <div
                    key={level}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-5 py-3.5 backdrop-blur-sm"
                  >
                    <span className="text-sm font-medium">{level}</span>
                    <span className="font-display text-sm font-bold text-lime-200">
                      {ghs([100000, 200000, 500000, 1000000][i])}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------- final CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-[2rem] border border-ink-900/8 bg-lime-50 px-8 py-16 text-center sm:px-14">
          <Container className="max-w-3xl">
            <h2 className="font-display text-3xl leading-[1.1] text-ink-900 sm:text-5xl">
              Your business belongs in this cohort.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
              {open
                ? `Applications for ${PROGRAMME.cohort} are open until ${formatDate(settings.applications_close_date)}. It is free to apply, and you can save your progress and return any time.`
                : `Applications for ${PROGRAMME.cohort} are closed. Join the interest list and we will text you the moment the next cohort opens.`}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button href={open ? "/apply" : "/interest"} size="lg">
                {open ? "Start your application" : "Join the interest list"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/about#faq" variant="outline" size="lg">
                Read the FAQs
              </Button>
            </div>
            <p className="mt-8 text-sm text-ink-500/70">
              Ages {PROGRAMME.ageRange} · {PROGRAMME.constituency} · No application fee
            </p>
          </Container>
        </div>
      </Section>
    </>
  );
}
