import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-lime-500 transition-transform duration-300 group-hover:scale-105">
        <SeedMark className="relative h-6 w-6 text-ink-950" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.95rem] font-bold tracking-tight",
            tone === "dark" ? "text-ink-900" : "text-white",
          )}
        >
          Shama Business
        </span>
        <span
          className={cn(
            "font-display text-[0.95rem] font-bold tracking-tight",
            tone === "dark" ? "text-lime-600" : "text-lime-300",
          )}
        >
          Incubator
        </span>
      </span>
    </Link>
  );
}

/** A seed splitting into a rising shoot — ignite, fund, scale. */
export function SeedMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 22V11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 12C12 8.5 9.2 5.6 5.5 5.2c-.4 3.7 2.3 6.8 6.5 6.8Z"
        fill="currentColor"
      />
      <path
        d="M12.6 10.4c0-4 2.9-7.3 6.9-7.7.4 4-2.6 7.3-6.9 7.7Z"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  );
}

export function EmeliaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-emelia-arthur.png"
      alt="Emelia Arthur"
      width={366}
      height={227}
      className={className}
    />
  );
}
