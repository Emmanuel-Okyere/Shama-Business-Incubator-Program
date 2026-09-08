import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SeedMark } from "@/components/site/Logo";
import { PROGRAMME, ghs, TOTAL_FUNDING } from "@/lib/programme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* ------------------------------------------------------ brand side */}
      <aside className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-lime-500/15 blur-[110px]"
          aria-hidden
        />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-500">
            <SeedMark className="h-6 w-6 text-ink-950" />
          </span>
          <span className="font-display leading-tight font-bold">
            Shama Business
            <br />
            <span className="text-lime-300">Incubator</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-[1.05] font-bold">
            Ignite Ideas.
            <br />
            <span className="text-lime-400">Fund Potential.</span>
            <br />
            Scale Impact.
          </h2>
          <p className="mt-6 leading-relaxed text-white/55">
            100 entrepreneurs. Four clusters. An 8-week bootcamp, one-on-one mentorship and{" "}
            {ghs(TOTAL_FUNDING)} in grant funding for businesses in Shama.
          </p>

          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <Image
              src="/brand/hon-emelia-arthur.webp"
              alt={PROGRAMME.initiator}
              width={120}
              height={120}
              className="h-12 w-12 rounded-full object-cover object-top"
            />
            <div>
              <p className="font-display text-sm font-bold">{PROGRAMME.initiator}</p>
              <p className="mt-0.5 text-[0.72rem] leading-snug text-white/45">
                {PROGRAMME.initiatorRole}
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/35">
          © {new Date().getFullYear()} {PROGRAMME.name}
        </p>
      </aside>

      {/* ------------------------------------------------------ form side */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-lime-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the website
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
