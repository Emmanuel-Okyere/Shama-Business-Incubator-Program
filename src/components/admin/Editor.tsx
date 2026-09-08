"use client";

import { useActionState, useState, useTransition } from "react";
import { ChevronDown, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/Field";
import type { ContentState } from "@/lib/actions/content";
import { cn } from "@/lib/utils";

/**
 * A create/edit form that collapses when it is not in use, so a page can hold
 * a list plus its editor without either burying the other.
 */
export function Collapsible({
  title,
  subtitle,
  openLabel = "Add new",
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  openLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left transition-colors hover:bg-lime-50/50"
      >
        <span>
          <span className="block font-display text-lg text-ink-900">{title}</span>
          {subtitle && <span className="mt-0.5 block text-[0.85rem] text-ink-500">{subtitle}</span>}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-lime-500 px-4 py-2 text-[0.8rem] font-semibold text-ink-950">
          {open ? (
            <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {open ? "Close" : openLabel}
        </span>
      </button>

      {open && <div className="border-t border-ink-900/8 p-7">{children}</div>}
    </section>
  );
}

export function EditorForm({
  action,
  submitLabel = "Save",
  children,
  onSaved,
}: {
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  submitLabel?: string;
  children: (state: ContentState) => React.ReactNode;
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ContentState, FormData>(action, {});

  if (state.ok && onSaved) onSaved();

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}
      {children(state)}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

/**
 * Delete control that surfaces the server's refusal instead of failing
 * silently — the actions decline to remove anything people have already
 * answered or scored against, and the reason is the useful part.
 */
export function DeleteButton({
  onDelete,
  label = "Delete",
  confirm = "Delete this permanently?",
  className,
}: {
  onDelete: () => Promise<ContentState | void>;
  label?: string;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirm)) return;
          setError(null);
          start(async () => {
            const result = await onDelete();
            if (result && result.ok === false) setError(result.message ?? "Could not delete.");
          });
        }}
        className={cn(
          "inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink-500 transition-colors hover:text-brandred disabled:opacity-50",
          className,
        )}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        {label}
      </button>
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-[0.8rem] leading-relaxed text-red-800">
          {error}
        </p>
      )}
    </>
  );
}
