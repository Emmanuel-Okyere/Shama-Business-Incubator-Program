import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { EmeliaLogo, SeedMark } from "@/components/site/Logo";
import { Container } from "@/components/ui/Section";
import { CLUSTERS, PROGRAMME } from "@/lib/programme";

function columnsFor(signedIn: boolean) {
  return [
  {
    title: "Programme",
    links: [
      { label: "About the Incubator", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Programme Journey", href: "/programme-journey" },
      { label: "Funding Model", href: "/funding" },
      { label: "Impact", href: "/impact" },
    ],
  },
  {
    title: "Take Part",
    links: [
      { label: "Apply Now", href: "/apply" },
      { label: "Become a Mentor", href: "/mentorship#become-a-mentor" },
      { label: "Partner With Us", href: "/partners#become-a-partner" },
      { label: "Entrepreneurs", href: "/entrepreneurs" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Stay Informed",
    links: [
      { label: "News & Updates", href: "/news" },
      { label: "Frequently Asked Questions", href: "/about#faq" },
      { label: "Contact the Team", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      signedIn
        ? { label: "Your Dashboard", href: "/portal" }
        : { label: "Sign in", href: "/login" },
    ],
  },
  ];
}

export function Footer({ signedIn = false }: { signedIn?: boolean }) {
  const columns = columnsFor(signedIn);

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-lime-500/12 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid gap-12 py-20 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-lime-500">
                <SeedMark className="h-7 w-7 text-ink-950" />
              </span>
              <span className="font-display text-xl font-bold leading-tight">
                Shama Business
                <br />
                <span className="text-lime-300">Incubator</span>
              </span>
            </div>

            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/55">
              {PROGRAMME.tagline} An initiative by {PROGRAMME.initiator}, {PROGRAMME.initiatorRole}.
            </p>

            <div className="mt-8 space-y-3 text-[0.9rem] text-white/60">
              <a
                href={`mailto:${PROGRAMME.email}`}
                className="flex items-center gap-3 transition-colors hover:text-lime-300"
              >
                <Mail className="h-4 w-4 shrink-0 text-lime-400" />
                {PROGRAMME.email}
              </a>
              <a
                href={`tel:${PROGRAMME.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 transition-colors hover:text-lime-300"
              >
                <Phone className="h-4 w-4 shrink-0 text-lime-400" />
                {PROGRAMME.phone}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
                {PROGRAMME.address}
              </p>
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3">
              <EmeliaLogo className="h-8 w-auto" />
              <span className="max-w-[11rem] text-[0.7rem] leading-tight font-medium text-ink-500">
                An initiative by Hon. Emelia Arthur, MP for Shama
              </span>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-[0.75rem] font-bold tracking-[0.16em] text-lime-300 uppercase">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-[0.9rem] text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/10 py-8">
          {CLUSTERS.map((cluster) => (
            <Link
              key={cluster.slug}
              href={`/clusters/${cluster.slug}`}
              className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:border-lime-400/50 hover:bg-lime-500/10 hover:text-lime-300"
            >
              {cluster.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {PROGRAMME.name}. {PROGRAMME.constituency}.
          </p>
          <p className="font-display tracking-wide text-lime-300/70 uppercase">
            {PROGRAMME.deckTagline}
          </p>
        </div>
      </Container>
    </footer>
  );
}
