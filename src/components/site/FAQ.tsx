"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FAQS } from "@/lib/programme";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-900/8 overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left transition-colors hover:bg-lime-50/60 sm:px-8"
            >
              <span
                className={cn(
                  "font-display text-[1.05rem] leading-snug font-bold transition-colors",
                  isOpen ? "text-lime-700" : "text-ink-900",
                )}
              >
                {faq.q}
              </span>
              <span
                className={cn(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors",
                  isOpen ? "bg-lime-500 text-ink-950" : "bg-ink-900/6 text-ink-500",
                )}
              >
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-7 text-[0.95rem] leading-relaxed text-ink-500 sm:px-8 sm:pr-24">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
