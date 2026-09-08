"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Collapsible, DeleteButton, EditorForm } from "@/components/admin/Editor";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { submitted, wasChecked } from "@/lib/form-values";
import {
  activateCohort,
  deleteCohort,
  deleteCriterion,
  deleteQuestion,
  saveCohort,
  saveCriterion,
  saveQuestion,
  toggleQuestion,
} from "@/lib/actions/content";

function dateValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export interface CohortRow {
  id: string;
  name: string;
  slug: string;
  year: number;
  seats: number;
  isActive: boolean;
  applicationsOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  bootcampStartsAt: string | null;
  ultimatePitchAt: string | null;
  applications: number;
}

export function CohortFields({ cohort }: { cohort?: CohortRow }) {
  return (
    <EditorForm action={saveCohort} submitLabel={cohort ? "Save cohort" : "Create cohort"}>
      {(state) => (
        <>
          {cohort && <input type="hidden" name="id" value={cohort.id} />}

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Cohort name" required error={state.errors?.name} className="sm:col-span-2">
              <Input name="name" defaultValue={submitted(state.values, "name", cohort?.name)} placeholder="Cohort 2" />
            </Field>
            <Field label="Year" required error={state.errors?.year}>
              <Input
                name="year"
                type="number"
                min={2020}
                max={2100}
                defaultValue={submitted(state.values, "year", cohort?.year ?? new Date().getFullYear() + 1)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Participant seats" required error={state.errors?.seats}>
              <Input name="seats" type="number" min={1} defaultValue={submitted(state.values, "seats", cohort?.seats ?? 100)} />
            </Field>
            <Field label="Applications open" error={state.errors?.opensAt}>
              <Input name="opensAt" type="date" defaultValue={submitted(state.values, "opensAt", dateValue(cohort?.opensAt ?? null))} />
            </Field>
            <Field label="Applications close" error={state.errors?.closesAt}>
              <Input name="closesAt" type="date" defaultValue={submitted(state.values, "closesAt", dateValue(cohort?.closesAt ?? null))} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Bootcamp starts" error={state.errors?.bootcampStartsAt}>
              <Input
                name="bootcampStartsAt"
                type="date"
                defaultValue={submitted(state.values, "bootcampStartsAt", dateValue(cohort?.bootcampStartsAt ?? null))}
              />
            </Field>
            <Field label="Ultimate Pitch" error={state.errors?.ultimatePitchAt}>
              <Input
                name="ultimatePitchAt"
                type="date"
                defaultValue={submitted(state.values, "ultimatePitchAt", dateValue(cohort?.ultimatePitchAt ?? null))}
              />
            </Field>
          </div>

          <div className="rounded-2xl bg-lime-50 p-5">
            <Checkbox
              name="applicationsOpen"
              defaultChecked={
                state.values
                  ? wasChecked(state.values, "applicationsOpen")
                  : (cohort?.applicationsOpen ?? true)
              }
              label="Accept applications for this cohort"
            />
          </div>

          {!cohort && (
            <p className="text-[0.82rem] leading-relaxed text-ink-500">
              A new cohort starts with the programme&apos;s seven standard scoring criteria, which
              you can edit afterwards. Activate it when you are ready for it to be the live cohort.
            </p>
          )}
        </>
      )}
    </EditorForm>
  );
}

export function NewCohort() {
  return (
    <Collapsible
      title="Create a cohort"
      subtitle="Cohort 2, 3 and beyond — dates, seats and scoring are configured per cohort"
      openLabel="New cohort"
    >
      <CohortFields />
    </Collapsible>
  );
}

export function ActivateButton({ cohortId, isActive }: { cohortId: string; isActive: boolean }) {
  const [pending, start] = useTransition();

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-500 px-3 py-1.5 text-[0.72rem] font-semibold text-ink-950">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Live cohort
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void activateCohort(cohortId))}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/15 px-3 py-1.5 text-[0.72rem] font-medium text-ink-500 transition-colors hover:border-lime-500 hover:bg-lime-50 hover:text-lime-700 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Circle className="h-3.5 w-3.5" />}
      Make live
    </button>
  );
}

export function DeleteCohort({ cohortId }: { cohortId: string }) {
  return (
    <DeleteButton
      label="Delete"
      confirm="Delete this cohort? This cannot be undone."
      onDelete={() => deleteCohort(cohortId)}
    />
  );
}

/* ------------------------------------------------------ scoring criteria */

export function NewCriterion({ cohortId }: { cohortId: string }) {
  return (
    <Collapsible
      title="Scoring criteria"
      subtitle="What reviewers score applications against, and how heavily each counts"
      openLabel="Add criterion"
    >
      <EditorForm action={saveCriterion} submitLabel="Add criterion">
        {(state) => (
          <>
            <input type="hidden" name="cohortId" value={cohortId} />
            <Field label="Criterion" required error={state.errors?.name}>
              <Input name="name" defaultValue={submitted(state.values, "name")} placeholder="Market potential" />
            </Field>
            <Field label="Guidance for reviewers">
              <Input name="description" defaultValue={submitted(state.values, "description")} placeholder="How big is the demand, and is it proven?" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Weight" required hint="How heavily this counts, 1–10" error={state.errors?.weight}>
                <Input name="weight" type="number" min={1} max={10} defaultValue={submitted(state.values, "weight", 2)} />
              </Field>
              <Field label="Maximum score" required error={state.errors?.maxScore}>
                <Input name="maxScore" type="number" min={1} max={100} defaultValue={submitted(state.values, "maxScore", 10)} />
              </Field>
            </div>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}

export function DeleteCriterion({ id, cohortId }: { id: string; cohortId: string }) {
  return (
    <DeleteButton
      label="Remove"
      confirm="Remove this scoring criterion?"
      onDelete={() => deleteCriterion(id, cohortId)}
    />
  );
}

/* --------------------------------------------------- application questions */

const TYPES: [string, string][] = [
  ["short_text", "Short answer"],
  ["long_text", "Long answer"],
  ["select", "Dropdown"],
  ["radio", "Multiple choice (one)"],
  ["checkbox", "Checkboxes (many)"],
  ["yes_no", "Yes / No"],
  ["number", "Number"],
  ["file", "File upload"],
];

export function NewQuestion({ cohortId }: { cohortId: string }) {
  return (
    <Collapsible
      title="Application questions"
      subtitle="Extra questions asked on top of the standard application, editable without a developer"
      openLabel="Add question"
    >
      <EditorForm action={saveQuestion} submitLabel="Add question">
        {(state) => (
          <>
            <input type="hidden" name="cohortId" value={cohortId} />
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Section" required error={state.errors?.section}>
                <Select
              key={submitted(state.values, "section", "Business")}
              name="section"
              defaultValue={submitted(state.values, "section", "Business")}
            >
                  {["Applicant", "Business", "Founder", "Other"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Answer type" required error={state.errors?.type} className="sm:col-span-2">
                <Select
              key={submitted(state.values, "type", "short_text")}
              name="type"
              defaultValue={submitted(state.values, "type", "short_text")}
            >
                  {TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Question" required error={state.errors?.label}>
              <Input name="label" defaultValue={submitted(state.values, "label")} placeholder="Do you currently keep written financial records?" />
            </Field>

            <Field label="Help text">
              <Input name="helpText" defaultValue={submitted(state.values, "helpText")} placeholder="Shown under the question" />
            </Field>

            <Field
              label="Options"
              hint="One per line — required for dropdown, multiple choice and checkboxes"
              error={state.errors?.options}
            >
              <Textarea name="options" rows={4} defaultValue={submitted(state.values, "options")} placeholder={"Access to capital\nFinding customers"} />
            </Field>

            <div className="rounded-2xl bg-lime-50 p-5">
              <Checkbox
              key={String(wasChecked(state.values, "required"))} name="required" defaultChecked={wasChecked(state.values, "required")} label="Applicants must answer this question" />
            </div>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}

export function QuestionControls({
  id,
  cohortId,
  active,
}: {
  id: string;
  cohortId: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => void toggleQuestion(id, cohortId, !active))}
        className="text-[0.8rem] font-medium text-ink-500 transition-colors hover:text-lime-700 disabled:opacity-50"
      >
        {pending ? "…" : active ? "Deactivate" : "Activate"}
      </button>
      <DeleteButton
        label="Remove"
        confirm="Remove this question?"
        onDelete={() => deleteQuestion(id, cohortId)}
      />
    </div>
  );
}
