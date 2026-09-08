import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "cream";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-lime-500 text-ink-950 hover:bg-lime-400 shadow-[0_8px_24px_-10px_rgba(138,182,26,0.9)] hover:shadow-[0_12px_30px_-10px_rgba(138,182,26,0.95)] hover:-translate-y-0.5",
  dark: "bg-ink-900 text-white hover:bg-ink-700 hover:-translate-y-0.5",
  outline:
    "border border-ink-900/20 text-ink-900 hover:border-lime-500 hover:bg-lime-50 hover:text-lime-700",
  ghost: "text-ink-900 hover:bg-ink-900/5",
  cream: "bg-cream-100 text-ink-900 hover:bg-cream-200",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export function Button({ variant = "primary", size = "md", href, className, ...props }: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
