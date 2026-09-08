import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { prisma, safeQuery } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

async function getPost(slug: string) {
  return safeQuery(
    () => prisma.post.findFirst({ where: { slug, status: "PUBLISHED" } }),
    null,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDesc ?? post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-lime-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All updates
        </Link>

        <span className="mt-10 block text-[0.7rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          {post.category}
        </span>
        <h1 className="mt-4 font-display text-3xl leading-[1.1] text-ink-900 sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-500">{post.excerpt}</p>
        <p className="mt-6 border-b border-ink-900/8 pb-8 text-sm text-ink-500/70">
          {formatDate(post.publishedAt)} · {post.author}
        </p>

        {post.coverUrl && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl bg-lime-100">
            <Image src={post.coverUrl} alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="mt-10 space-y-6 text-[1.05rem] leading-relaxed text-ink-500">
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
