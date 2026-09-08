"use client";

import { useActionState } from "react";
import { Loader2, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormMessage, Textarea } from "@/components/ui/Field";
import {
  addNote,
  saveReview,
  updateApplicationStatus,
  type AdminState,
} from "@/lib/actions/admin";
import { STATUS_META } from "@/lib/status";
import type { ApplicationStatus } from "@prisma/client";

const CHANGEABLE: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "NOT_SELECTED",
  "WITHDRAWN",
];

const NOTIFIES: ApplicationStatus[] = ["SHORTLISTED", "INTERVIEW", "SELECTED", "NOT_SELECTED"];

export function StatusPanel({
  applicationId,
  current,
  hasPhone,
}: {
  applicationId: string;
  current: ApplicationStatus;
  hasPhone: boolean;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateApplicationStatus,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />

      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}

      <div className="grid gap-2">
        {CHANGEABLE.map((status) => (
          <label
            key={status}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-2.5 transition-colors has-checked:border-lime-500 has-checked:bg-lime-50"
          >
            <input
              type="radio"
              name="status"
              value={status}
              defaultChecked={status === current}
              className="h-4 w-4 accent-lime-600"
            />
            <span className="text-[0.88rem] font-medium text-ink-900">
              {STATUS_META[status].label}
            </span>
            {NOTIFIES.includes(status) && (
              <span className="ml-auto text-[0.68rem] font-semibold tracking-wide text-lime-700 uppercase">
                texts applicant
              </span>
            )}
          </label>
        ))}
      </div>

      <Checkbox
        name="notify"
        defaultChecked={hasPhone}
        disabled={!hasPhone}
        label={
          hasPhone
            ? "Send the matching SMS notification to the applicant"
            : "No phone number on this account — SMS unavailable"
        }
      />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}

export function ScorePanel({
  applicationId,
  criteria,
  existing,
}: {
  applicationId: string;
  criteria: { id: string; name: string; description: string | null; weight: number; maxScore: number }[];
  existing: { comment: string | null; total: number; scores: Record<string, number> } | null;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveReview, {});

  if (criteria.length === 0) {
    return (
      <p className="text-[0.88rem] leading-relaxed text-ink-500">
        No scoring criteria are configured for this cohort yet. Seed them or add them in the
        database, and the scorecard will appear here.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="applicationId" value={applicationId} />

      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}

      {criteria.map((criterion) => (
        <div key={criterion.id}>
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={`score_${criterion.id}`}
              className="text-[0.85rem] font-semibold text-ink-900"
            >
              {criterion.name}
            </label>
            <span className="text-[0.72rem] text-ink-500">
              weight ×{criterion.weight} · max {criterion.maxScore}
            </span>
          </div>
          {criterion.description && (
            <p className="mt-0.5 text-[0.78rem] text-ink-500">{criterion.description}</p>
          )}
          <input
            id={`score_${criterion.id}`}
            name={`score_${criterion.id}`}
            type="number"
            min={0}
            max={criterion.maxScore}
            defaultValue={existing?.scores[criterion.id] ?? ""}
            placeholder="0"
            className="mt-2 w-full rounded-xl border border-ink-900/12 px-4 py-2.5 text-[0.9rem] focus:border-lime-500 focus:ring-4 focus:ring-lime-500/12 focus:outline-none"
          />
        </div>
      ))}

      <div>
        <label className="mb-2 block text-[0.85rem] font-semibold text-ink-900">
          Reviewer comment
        </label>
        <Textarea name="comment" rows={3} defaultValue={existing?.comment ?? ""} />
      </div>

      {existing && (
        <p className="rounded-xl bg-lime-50 px-4 py-3 text-[0.85rem] text-lime-900">
          Your current score: <strong>{existing.total.toFixed(1)}/100</strong>
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? "Saving…" : "Save score"}
      </Button>
    </form>
  );
}

export function NotePanel({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(addNote, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}
      <Textarea name="body" rows={3} placeholder="Internal note — not visible to the applicant" />
      <Button type="submit" size="sm" disabled={pending} variant="outline">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Add note
      </Button>
    </form>
  );
}
