import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Section";

const POSITIONS = {
  left: "20% center",
  center: "center",
  right: "80% center",
  top: "center 22%",
} as const;

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imagePosition = "center",
  crumbs = [],
  accent,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  image?: string;
  /** Which part of the photograph the header frames on. */
  imagePosition?: "left" | "center" | "right" | "top";
  crumbs?: { label: string; href: string }[];
  accent?: string;
  children?: React.ReactNode;
}) {
  const tint = accent ?? "#8ab61a";

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      {!image && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,rgba(138,182,26,0.20),transparent_60%)]"
        />
      )}
      {image && (
        <>
          {/*
            The photograph carries the header, so it runs at full strength. The
            scrim is directional rather than a flat wash: heaviest behind the
            text on the left, clearing to almost nothing on the right so the
            image itself is actually visible.
          */}
          <Image
            src={image}
            alt=""
            fill
            priority
            quality={86}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: POSITIONS[imagePosition] }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/45" />
        </>
      )}

      {/*
        The picture runs edge to edge and the scrim does the separating, rather
        than the picture being boxed off from the header. Two zones: solid ink
        under the words so they stay readable, clearing to almost nothing on
        the open side so the photograph is genuinely visible there.
      */}
      {image ? (
        <>
          {/* Narrow screens stack the copy over the middle of the frame, so the
              wash has to be even rather than directional. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-ink-950/92 via-ink-950/74 to-ink-950/88 lg:hidden"
          />
          <div
            aria-hidden
            className="absolute inset-0 hidden lg:block"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #0f1126 0%, #0f1126 30%, rgba(15,17,38,0.84) 48%, rgba(15,17,38,0.34) 70%, rgba(15,17,38,0.06) 100%)",
            }}
          />
          {/* Grounds the header against the section below it. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(110% 120% at 10% 0%, ${tint}2e, transparent 62%)`,
          }}
        />
      )}

      <Container className="relative">
        <div className="max-w-2xl py-16 sm:py-20 lg:py-24">
          <nav className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-white/45">
            <Link href="/" className="transition-colors hover:text-lime-300">
              Home
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                <Link href={crumb.href} className="transition-colors hover:text-lime-300">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>

          <span className="bracket-frame mt-8 inline-flex">
            <span
              className="rounded-md px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-ink-950 uppercase"
              style={{ backgroundColor: tint }}
            >
              {eyebrow}
            </span>
          </span>

          <h1 className="mt-7 font-display text-[2.4rem] leading-[1.03] font-bold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>

          {lead && <p className="mt-6 text-lg leading-relaxed text-white/70">{lead}</p>}

          {children && <div className="mt-9">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
