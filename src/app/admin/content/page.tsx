import type { Metadata } from "next";
import {
  DeleteEvent,
  DeletePartner,
  DeletePost,
  NewEvent,
  NewPartner,
  NewPost,
} from "@/components/admin/ContentForms";
import { prisma, safeQuery } from "@/lib/db";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: "bg-lime-100 text-lime-800",
  DRAFT: "bg-ink-900/6 text-ink-500",
  SCHEDULED: "bg-amber-100 text-amber-800",
  ARCHIVED: "bg-ink-900/6 text-ink-500",
};

export default async function ContentPage() {
  const [posts, events, partners] = await Promise.all([
    safeQuery(() => prisma.post.findMany({ orderBy: { publishedAt: "desc" } }), []),
    safeQuery(() => prisma.event.findMany({ orderBy: { startsAt: "desc" } }), []),
    safeQuery(() => prisma.partner.findMany({ orderBy: { order: "asc" } }), []),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Website content
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">News, events &amp; partners</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Everything here publishes straight to the public website. No developer needed.
        </p>
      </header>

      <div className="space-y-6">
        <NewPost />

        <Panel title={`Posts (${posts.length})`} empty="No posts yet." isEmpty={posts.length === 0}>
          {posts.map((post) => (
            <Row
              key={post.id}
              title={post.title}
              meta={`${post.category} · ${formatDate(post.publishedAt)} · /news/${post.slug}`}
              status={post.status}
              action={<DeletePost id={post.id} />}
            />
          ))}
        </Panel>

        <NewEvent />

        <Panel
          title={`Events (${events.length})`}
          empty="No events yet."
          isEmpty={events.length === 0}
        >
          {events.map((event) => (
            <Row
              key={event.id}
              title={event.title}
              meta={`${event.kind} · ${formatDateTime(event.startsAt)} · ${event.location}`}
              status={event.status}
              action={<DeleteEvent id={event.id} />}
            />
          ))}
        </Panel>

        <NewPartner />

        <Panel
          title={`Partners (${partners.length})`}
          empty="No partners yet."
          isEmpty={partners.length === 0}
        >
          {partners.map((partner) => (
            <Row
              key={partner.id}
              title={partner.name}
              meta={[partner.tier, partner.website, `order ${partner.order}`]
                .filter(Boolean)
                .join(" · ")}
              status={partner.featured ? "FEATURED" : undefined}
              action={<DeletePartner id={partner.id} />}
            />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  empty,
  isEmpty,
}: {
  title: string;
  children: React.ReactNode;
  empty: string;
  isEmpty: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
      <div className="border-b border-ink-900/8 px-7 py-5">
        <h2 className="font-display text-lg text-ink-900">{title}</h2>
      </div>
      {isEmpty ? (
        <p className="px-7 py-10 text-center text-[0.9rem] text-ink-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-ink-900/6">{children}</ul>
      )}
    </section>
  );
}

function Row({
  title,
  meta,
  status,
  action,
}: {
  title: string;
  meta: string;
  status?: string;
  action: React.ReactNode;
}) {
  return (
    <li className="flex items-start justify-between gap-6 px-7 py-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink-900">{title}</p>
        <p className="mt-0.5 truncate text-[0.78rem] text-ink-500">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {status && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[0.7rem] font-semibold",
              STATUS_CLASS[status] ?? "bg-lime-100 text-lime-800",
            )}
          >
            {status.toLowerCase()}
          </span>
        )}
        {action}
      </div>
    </li>
  );
}
