import { Trophy } from "lucide-react";
import { FUNDING_TIERS, TOTAL_FUNDING, ghs } from "@/lib/programme";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function FundingTiers({ tone = "light" }: { tone?: "light" | "dark" }) {
  const max = Math.max(...FUNDING_TIERS.map((t) => t.amount));

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {FUNDING_TIERS.map((tier, i) => (
        <Reveal key={tier.tier} delay={i * 80} as="article" className="h-full">
          <div
            className={cn(
              "relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1.5",
              tone === "dark"
                ? "border-white/10 bg-white/[0.04] hover:border-lime-400/40"
                : "border-ink-900/8 bg-white hover:shadow-card",
              i === 0 && (tone === "dark" ? "bg-lime-500/10" : "bg-lime-50"),
            )}
          >
            {i === 0 && (
              <span className="absolute top-6 right-6 grid h-9 w-9 place-items-center rounded-full bg-lime-500 text-ink-950">
                <Trophy className="h-4 w-4" />
              </span>
            )}

            <p
              className={cn(
                "text-[0.7rem] font-semibold tracking-[0.14em] uppercase",
                tone === "dark" ? "text-lime-300" : "text-lime-700",
              )}
            >
              {tier.tier}
            </p>

            <p
              className={cn(
                "mt-4 font-display text-3xl font-bold",
                tone === "dark" ? "text-white" : "text-ink-900",
              )}
            >
              {ghs(tier.amount)}
            </p>
            <p className={cn("mt-1 text-sm", tone === "dark" ? "text-white/45" : "text-ink-500")}>
              each · {tier.count} businesses
            </p>

            <div
              className={cn(
                "mt-5 h-1.5 overflow-hidden rounded-full",
                tone === "dark" ? "bg-white/10" : "bg-ink-900/8",
              )}
            >
              <div
                className="h-full rounded-full bg-lime-500"
                style={{ width: `${(tier.amount / max) * 100}%` }}
              />
            </div>

            <p
              className={cn(
                "mt-5 flex-1 text-[0.9rem] leading-relaxed",
                tone === "dark" ? "text-white/55" : "text-ink-500",
              )}
            >
              {tier.note}
            </p>

            <p
              className={cn(
                "mt-6 border-t pt-4 text-sm font-semibold",
                tone === "dark" ? "border-white/10 text-white" : "border-ink-900/8 text-ink-900",
              )}
            >
              {ghs(tier.amount * tier.count)} allocated
            </p>
          </div>
        </Reveal>
      ))}

      <div
        className={cn(
          "lg:col-span-4",
          "flex flex-col items-start justify-between gap-4 rounded-3xl px-8 py-7 sm:flex-row sm:items-center",
          tone === "dark" ? "bg-lime-500 text-ink-950" : "bg-ink-950 text-white",
        )}
      >
        <div>
          <p
            className={cn(
              "text-[0.7rem] font-semibold tracking-[0.14em] uppercase",
              tone === "dark" ? "text-ink-950/60" : "text-lime-300",
            )}
          >
            Total proposed grant funding
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold sm:text-4xl">{ghs(TOTAL_FUNDING)}</p>
        </div>
        <p
          className={cn(
            "max-w-md text-sm leading-relaxed",
            tone === "dark" ? "text-ink-950/70" : "text-white/55",
          )}
        >
          Allocated to 20 finalists — five from each cluster — based on performance at the Ultimate
          Pitch before judges, investors and stakeholders.
        </p>
      </div>
    </div>
  );
}
