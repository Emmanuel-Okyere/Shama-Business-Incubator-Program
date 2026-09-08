import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "News, announcements, success stories and programme updates from the Shama Business Incubator.",
};

export const revalidate = 300;

export default async function NewsPage() {
  const posts = await safeQuery(
    () =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      }),
    [],
  );

  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="News & Updates"
        crumbs={[{ label: "News", href: "/news" }]}
        title="What the programme is doing"
        lead="Announcements, success stories, event recaps and programme milestones."
      image="/brand/photo-branding.webp"
      />

      <Section>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-900/15 bg-lime-50/60 px-8 py-20 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-lime-600">
              <Newspaper className="h-6 w-6" />
            </span>
            <h2 className="mt-6 font-display text-2xl text-ink-900">Nothing published yet</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
              Programme news and announcements will appear here as the cohort progresses.
            </p>
          </div>
        ) : (
          <>
            {lead && (
              <Link
                href={`/news/${lead.slug}`}
                className="group grid gap-8 overflow-hidden rounded-3xl border border-ink-900/8 bg-white lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] bg-lime-100 lg:aspect-auto">
                  {lead.coverUrl ? (
                    <Image
                      src={lead.coverUrl}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-lime-900 to-ink-950" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:py-12 lg:pr-12 lg:pl-0">
                  <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                    {lead.category}
                  </span>
                  <h2 className="mt-4 font-display text-2xl leading-snug text-ink-900 sm:text-3xl">
                    {lead.title}
                  </h2>
                  <p className="mt-4 leading-relaxed text-ink-500">{lead.excerpt}</p>
                  <p className="mt-6 text-sm text-ink-500/70">
                    {formatDate(lead.publishedAt)} · {lead.author}
                  </p>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={i * 60} as="article">
                    <Link
                      href={`/news/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                    >
                      {post.coverUrl && (
                        <div className="relative aspect-[16/10] bg-lime-100">
                          <Image
                            src={post.coverUrl}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-7">
                        <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
                          {post.category}
                        </span>
                        <h3 className="mt-3 font-display text-lg leading-snug text-ink-900">
                          {post.title}
                        </h3>
                        <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-ink-500">
                          {post.excerpt}
                        </p>
                        <p className="mt-6 text-xs text-ink-500/70">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
