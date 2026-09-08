"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// useLayoutEffect warns when React renders this on the server; the pre-paint
// timing it buys only matters in the browser.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Fades and lifts its children into view on scroll.
 *
 * Content is visible in the server-rendered markup and stays visible unless
 * the browser has actually taken over: hiding first and revealing with
 * JavaScript would leave the page blank for a reader without it, for a
 * crawler, and in print. The hidden state is therefore applied in a layout
 * effect — before the first paint, so there is no flicker — and a timeout
 * reveals the content anyway if the intersection observer never reports,
 * which happens in background tabs and some embedded browsers.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(true);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(false);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The layout effect left the content visible, so there is nothing to
    // reveal.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = () => {
      setShown(true);
      io.disconnect();
      clearTimeout(fallback);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);

    const fallback = setTimeout(reveal, 1500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
