import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[0.95rem] text-ink-900 placeholder:text-ink-500/45 transition-colors focus:border-lime-500 focus:ring-4 focus:ring-lime-500/12 focus:outline-none disabled:bg-ink-900/[0.03]";

export function Label({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block">
      <span className="text-[0.85rem] font-semibold text-ink-900">
        {children}
        {required && <span className="ml-1 text-brandred">*</span>}
      </span>
      {hint && <span className="mt-0.5 block text-[0.78rem] font-normal text-ink-500">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} className={cn(control, "resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "appearance-none bg-no-repeat pr-10", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label hint={hint} required={required}>
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-[0.8rem] font-medium text-brandred">{error}</p>}
    </div>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-ink-900/20 text-lime-600 accent-lime-600 focus:ring-lime-500/30"
        {...props}
      />
      <span className="text-[0.88rem] leading-snug text-ink-500">{label}</span>
    </label>
  );
}

export function FormMessage({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl px-5 py-4 text-[0.9rem] leading-relaxed",
        tone === "ok"
          ? "bg-lime-100 text-lime-900"
          : "bg-red-50 text-red-800",
      )}
    >
      {children}
    </div>
  );
}
