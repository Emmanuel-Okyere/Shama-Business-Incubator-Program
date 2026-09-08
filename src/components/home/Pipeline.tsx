"use client";

import { useState } from "react";
import { PIPELINE } from "@/lib/programme";
import { cn } from "@/lib/utils";

/** Identify → Train → Mentor → Pitch → Fund → Scale (deck p.3). */
export function Pipeline() {
  const [active, setActive] = useState(0);
  const stage = PIPELINE[active];

  return (
    <div>
      <div className="relative">
        {/* rail */}
        <div className="absolute top-6 right-0 left-0 hidden h-px bg-ink-900/10 md:block" aria-hidden />
        <div
          className="absolute top-6 left-0 hidden h-px bg-lime-500 transition-all duration-500 md:block"
          style={{ width: `${((active + 0.5) / PIPELINE.length) * 100}%` }}
          aria-hidden
        />

        <ol className="relative grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-6 md:gap-x-2">
          {PIPELINE.map((step, i) => {
            const done = i <= active;
            return (
              <li key={step.key}>
                <button
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className="group flex w-full flex-col items-start gap-3 text-left md:items-center md:text-center"
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-sm font-bold ring-4 ring-white transition-all duration-300",
                      done
                        ? "bg-lime-500 text-ink-950"
                        : "bg-white text-ink-500 ring-white outline outline-ink-900/10",
                      i === active && "scale-110 shadow-[0_10px_28px_-10px_rgba(138,182,26,0.9)]",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[0.95rem] font-bold transition-colors",
                      i === active ? "text-ink-900" : "text-ink-500 group-hover:text-ink-900",
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div key={stage.key} className="animate-rise mt-10 rounded-3xl bg-lime-50 p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="bracket-frame inline-flex shrink-0 self-start">
            <span className="rounded-md bg-lime-500 px-3 py-1.5 font-display text-[0.7rem] font-bold tracking-[0.14em] text-ink-950 uppercase">
              Step {String(active + 1).padStart(2, "0")}
            </span>
          </span>
          <div>
            <h3 className="font-display text-2xl text-ink-900">{stage.line}</h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-500">{stage.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
