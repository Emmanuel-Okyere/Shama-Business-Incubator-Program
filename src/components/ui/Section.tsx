import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** The deck's cream corner-bracket motif around a lime label. */
export function Eyebrow({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span className="bracket-frame inline-flex">
      <span
        className={cn(
          "inline-block rounded-md px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] uppercase",
          tone === "light" ? "bg-lime-300 text-ink-900" : "bg-lime-500 text-ink-950",
        )}
      >
        {children}
      </span>
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <div className={cn("mb-6", align === "center" && "flex justify-center")}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={cn(
          "text-3xl leading-[1.1] sm:text-4xl lg:text-[2.9rem]",
          tone === "dark" ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            tone === "dark" ? "text-white/70" : "text-ink-500",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
