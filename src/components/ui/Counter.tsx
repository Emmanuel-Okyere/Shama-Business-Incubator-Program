"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect warns when React renders this on the server; the layout
// timing only matters in the browser.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Counts up to `to` when scrolled into view.
 *
 * The true figure is what renders on the server and what the component starts
 * from, so a reader without JavaScript, a printed page, or a tab where the
 * intersection observer never reports still sees the real number rather than
 * zero — these are programme impact figures, and showing 0 because an
 * animation did not start would be a lie. The count-up is layered on top in
 * the browser: the value is reset to zero before the first paint, and a
 * timeout snaps to the final figure if the observer never fires.
 */
export function Counter({
  to,
  duration = 1600,
  prefix = "",
  suffix = "",
  format = true,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setValue(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The layout effect left the final figure in place, so there is nothing
    // to animate and nothing to correct.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let settled = false;

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
        setValue(Math.round(to * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const settle = (run: () => void) => {
      if (settled) return;
      settled = true;
      io.disconnect();
      clearTimeout(fallback);
      run();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) settle(animate);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    const fallback = setTimeout(() => settle(() => setValue(to)), 1500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {format ? value.toLocaleString("en-GB") : value}
      {suffix}
    </span>
  );
}
