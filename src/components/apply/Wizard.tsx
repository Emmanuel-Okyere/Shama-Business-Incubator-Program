"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudUpload,
  FileText,
  Loader2,
  PartyPopper,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/Field";
import {
  removeDocument,
  saveStep1,
  saveStep2,
  saveStep3,
  submitApplication,
  uploadDocument,
  type ActionState,
} from "@/lib/actions/application";
import { submitted, wasChecked } from "@/lib/form-values";
import { CLUSTERS, ghs } from "@/lib/programme";
import { cn } from "@/lib/utils";

const CLUSTER_KEYS = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
] as const;

const STEPS = [
  { n: 1, label: "Your details" },
  { n: 2, label: "Your business" },
  { n: 3, label: "About you" },
  { n: 4, label: "Documents" },
  { n: 5, label: "Review & submit" },
];

const DOCUMENT_TYPES = [
  { kind: "IDENTIFICATION", label: "Identification", required: true, hint: "Ghana Card, passport or voter ID" },
  { kind: "BUSINESS_REGISTRATION", label: "Business registration", required: false, hint: "If your business is registered" },
  { kind: "PITCH_DECK", label: "Pitch deck", required: false, hint: "PDF or slides" },
  { kind: "BUSINESS_PLAN", label: "Business plan", required: false, hint: "If you have one written" },
  { kind: "PRODUCT_IMAGES", label: "Product images", required: false, hint: "Photos of what you make or sell" },
  { kind: "FINANCIAL_INFO", label: "Financial information", required: false, hint: "Sales records, bookkeeping" },
  { kind: "OTHER", label: "Other supporting document", required: false, hint: "Anything else relevant" },
] as const;

export interface WizardApplication {
  id: string;
  reference: string;
  currentStep: number;
  cluster: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  community: string | null;
  businessName: string | null;
  businessLocation: string | null;
  registrationStatus: string | null;
  businessStage: string | null;
  businessDescription: string | null;
  problemSolved: string | null;
  productService: string | null;
  targetMarket: string | null;
  currentCustomers: string | null;
  monthlyRevenue: string | null;
  employees: number | null;
  yearsOperating: number | null;
  challenges: string | null;
  growthPlans: string | null;
  fundingRequired: number | null;
  fundingUse: string | null;
  founderBackground: string | null;
  experience: string | null;
  education: string | null;
  priorVenture: string | null;
  motivation: string | null;
  goals: string | null;
  referralSource: string | null;
  documents: { id: string; kind: string; fileName: string; url: string; size: number | null }[];
}

export function Wizard({
  application,
  fullName,
  defaultCluster,
}: {
  application: WizardApplication;
  fullName: string;
  defaultCluster?: string;
}) {
  const [step, setStep] = useState(Math.min(5, Math.max(1, application.currentStep)));
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (submitted) return <Submitted reference={submitted} />;

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <StepRail step={step} onSelect={setStep} maxStep={application.currentStep} />

      <div className="min-w-0">
        <div className="mb-8 lg:hidden">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
            Step {step} of 5
          </p>
          <h2 className="mt-1.5 font-display text-2xl text-ink-900">{STEPS[step - 1].label}</h2>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-900/8">
            <div
              className="h-full rounded-full bg-lime-500 transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <Step1
            application={application}
            defaultCluster={defaultCluster}
            onDone={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2 application={application} onBack={() => setStep(1)} onDone={() => setStep(3)} />
        )}
        {step === 3 && (
          <Step3 application={application} onBack={() => setStep(2)} onDone={() => setStep(4)} />
        )}
        {step === 4 && (
          <Step4 application={application} onBack={() => setStep(3)} onDone={() => setStep(5)} />
        )}
        {step === 5 && (
          <Step5
            application={application}
            fullName={fullName}
            onBack={() => setStep(4)}
            onSubmitted={setSubmitted}
            onJump={setStep}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ rail */

function StepRail({
  step,
  maxStep,
  onSelect,
}: {
  step: number;
  maxStep: number;
  onSelect: (n: number) => void;
}) {
  return (
    <nav className="hidden lg:block">
      <ol className="sticky top-28 space-y-1">
        {STEPS.map((item) => {
          const done = item.n < Math.max(step, 1) && item.n <= maxStep;
          const active = item.n === step;
          const reachable = item.n <= maxStep;
          return (
            <li key={item.n}>
              <button
                onClick={() => reachable && onSelect(item.n)}
                disabled={!reachable}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors",
                  active && "bg-lime-50",
                  !reachable && "cursor-not-allowed opacity-45",
                  reachable && !active && "hover:bg-ink-900/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[0.78rem] font-bold transition-colors",
                    active
                      ? "bg-lime-500 text-ink-950"
                      : done
                        ? "bg-lime-600 text-white"
                        : "bg-ink-900/8 text-ink-500",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : item.n}
                </span>
                <span
                  className={cn(
                    "text-[0.9rem] font-medium",
                    active ? "text-lime-700" : "text-ink-500",
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="hidden lg:block">
        <h2 className="font-display text-3xl text-ink-900">{title}</h2>
        <p className="mt-2.5 text-ink-500">{lead}</p>
      </div>
      <div className="mt-0 lg:mt-9">{children}</div>
    </div>
  );
}

function Actions({
  onBack,
  pending,
  label = "Save and continue",
}: {
  onBack?: () => void;
  pending: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/8 pt-8">
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack} size="lg">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}
      <Button type="submit" size="lg" disabled={pending} className="ml-auto">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/* --------------------------------------------------------------- step 1 */

function Step1({
  application,
  defaultCluster,
  onDone,
}: {
  application: WizardApplication;
  defaultCluster?: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveStep1, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <StepShell title="Your details" lead="We confirm eligibility before anything else.">
      <form action={action} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Date of birth" required error={state.errors?.dateOfBirth}>
            <Input
              name="dateOfBirth"
              type="date"
              defaultValue={submitted(state.values, "dateOfBirth", application.dateOfBirth?.slice(0, 10))}
              max={new Date().toISOString().slice(0, 10)}
            />
          </Field>
          <Field label="Gender" required error={state.errors?.gender}>
            <Select
              key={submitted(state.values, "gender", application.gender)}
              name="gender"
              defaultValue={submitted(state.values, "gender", application.gender)}
            >
              <option value="">Select</option>
              {["Female", "Male", "Prefer not to say"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Community / town"
          required
          hint="Where in the Shama Constituency do you live or operate?"
          error={state.errors?.community}
        >
          <Input name="community" defaultValue={submitted(state.values, "community", application.community)} placeholder="e.g. Aboadze, Inchaban, Shama Junction" />
        </Field>

        <Field label="Which cluster are you applying to?" required error={state.errors?.cluster}>
          <div className="grid gap-3 sm:grid-cols-2">
            {CLUSTERS.map((cluster, i) => {
              const value = CLUSTER_KEYS[i];
              const checked = state.values
                ? state.values.cluster === value
                : application.cluster === value ||
                  (!application.cluster && defaultCluster === cluster.slug);
              return (
                <label
                  key={cluster.slug}
                  className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-900/10 p-4 transition-colors has-checked:border-lime-500 has-checked:bg-lime-50"
                >
                  <input
                    type="radio"
                    name="cluster"
                    value={value}
                    defaultChecked={checked}
                    className="mt-0.5 h-4.5 w-4.5 accent-lime-600"
                  />
                  <span>
                    <span className="block font-display text-[0.95rem] font-bold text-ink-900">
                      {cluster.name}
                    </span>
                    <span className="mt-1 block text-[0.8rem] leading-snug text-ink-500">
                      {cluster.focus.slice(0, 3).join(", ")}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Field>

        <div className="rounded-2xl bg-lime-50 p-6">
          <Checkbox
            name="eligibility"
            defaultChecked={
              state.values
                ? wasChecked(state.values, "eligibility")
                : Boolean(application.community)
            }
            label={
              <>
                I confirm I am aged 18–35, live or run my business within the Shama Constituency, and
                can attend in-person bootcamp sessions in Shama.
              </>
            }
          />
          {state.errors?.eligibility && (
            <p className="mt-2 text-[0.8rem] font-medium text-brandred">
              {state.errors.eligibility}
            </p>
          )}
        </div>

        <Actions pending={pending} />
      </form>
    </StepShell>
  );
}

/* --------------------------------------------------------------- step 2 */

function Step2({
  application,
  onBack,
  onDone,
}: {
  application: WizardApplication;
  onBack: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveStep2, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <StepShell
      title="Your business"
      lead="Be specific. Reviewers score on viability, market and how clearly you understand your own numbers."
    >
      <form action={action} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Business name" required error={state.errors?.businessName}>
            <Input name="businessName" defaultValue={submitted(state.values, "businessName", application.businessName)} />
          </Field>
          <Field label="Business location" required error={state.errors?.businessLocation}>
            <Input
              name="businessLocation"
              defaultValue={submitted(state.values, "businessLocation", application.businessLocation)}
              placeholder="Town or community"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Registration status" required error={state.errors?.registrationStatus}>
            <Select
              key={submitted(state.values, "registrationStatus", application.registrationStatus)}
              name="registrationStatus"
              defaultValue={submitted(state.values, "registrationStatus", application.registrationStatus)}
            >
              <option value="">Select</option>
              <option value="NOT_REGISTERED">Not registered</option>
              <option value="IN_PROGRESS">Registration in progress</option>
              <option value="REGISTERED">Registered</option>
            </Select>
          </Field>
          <Field label="Business stage" required error={state.errors?.businessStage}>
            <Select
              key={submitted(state.values, "businessStage", application.businessStage)}
              name="businessStage"
              defaultValue={submitted(state.values, "businessStage", application.businessStage)}
            >
              <option value="">Select</option>
              <option value="IDEA">Idea — not trading yet</option>
              <option value="EARLY_STAGE">Early stage — first customers</option>
              <option value="OPERATING">Operating — regular sales</option>
              <option value="GROWING">Growing — expanding</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Describe your business"
          required
          hint="What it is, what it does, how it makes money"
          error={state.errors?.businessDescription}
        >
          <Textarea name="businessDescription" rows={4} defaultValue={submitted(state.values, "businessDescription", application.businessDescription)} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Problem you are solving" required error={state.errors?.problemSolved}>
            <Textarea name="problemSolved" defaultValue={submitted(state.values, "problemSolved", application.problemSolved)} />
          </Field>
          <Field label="Product or service" required error={state.errors?.productService}>
            <Textarea name="productService" defaultValue={submitted(state.values, "productService", application.productService)} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Target market" required error={state.errors?.targetMarket}>
            <Textarea name="targetMarket" defaultValue={submitted(state.values, "targetMarket", application.targetMarket)} />
          </Field>
          <Field label="Current customers" hint="Roughly how many, and who are they?">
            <Textarea name="currentCustomers" defaultValue={submitted(state.values, "currentCustomers", application.currentCustomers)} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Monthly revenue">
            <Select
              key={submitted(state.values, "monthlyRevenue", application.monthlyRevenue)}
              name="monthlyRevenue"
              defaultValue={submitted(state.values, "monthlyRevenue", application.monthlyRevenue)}
            >
              <option value="">Select</option>
              {["No revenue yet", "Under GHS 500", "GHS 500 – 2,000", "GHS 2,000 – 5,000", "GHS 5,000 – 20,000", "Over GHS 20,000"].map(
                (r) => (
                  <option key={r}>{r}</option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Number of employees" error={state.errors?.employees}>
            <Input
              name="employees"
              type="number"
              min={0}
              defaultValue={submitted(state.values, "employees", application.employees ?? 0)}
            />
          </Field>
          <Field label="Years in operation" error={state.errors?.yearsOperating}>
            <Input
              name="yearsOperating"
              type="number"
              min={0}
              step="0.5"
              defaultValue={submitted(state.values, "yearsOperating", application.yearsOperating ?? 0)}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Current challenges" required error={state.errors?.challenges}>
            <Textarea name="challenges" defaultValue={submitted(state.values, "challenges", application.challenges)} />
          </Field>
          <Field label="Growth plans" required error={state.errors?.growthPlans}>
            <Textarea name="growthPlans" defaultValue={submitted(state.values, "growthPlans", application.growthPlans)} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
          <Field
            label="Funding required (GHS)"
            hint={`Grants range ${ghs(10000)}–${ghs(50000)}`}
            error={state.errors?.fundingRequired}
          >
            <Input
              name="fundingRequired"
              type="number"
              min={0}
              step={1000}
              defaultValue={submitted(state.values, "fundingRequired", application.fundingRequired)}
              placeholder="30000"
            />
          </Field>
          <Field
            label="What would the funding be used for?"
            required
            hint="Be concrete — equipment, stock, premises, staff"
            error={state.errors?.fundingUse}
          >
            <Textarea name="fundingUse" defaultValue={submitted(state.values, "fundingUse", application.fundingUse)} />
          </Field>
        </div>

        <Actions onBack={onBack} pending={pending} />
      </form>
    </StepShell>
  );
}

/* --------------------------------------------------------------- step 3 */

function Step3({
  application,
  onBack,
  onDone,
}: {
  application: WizardApplication;
  onBack: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveStep3, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <StepShell
      title="About you"
      lead="Founder capability is one of the scoring criteria. This is where you make your case."
    >
      <form action={action} className="space-y-6">
        <Field
          label="Your background"
          required
          hint="Who you are and what you have done"
          error={state.errors?.founderBackground}
        >
          <Textarea name="founderBackground" rows={4} defaultValue={submitted(state.values, "founderBackground", application.founderBackground)} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Relevant experience" required error={state.errors?.experience}>
            <Textarea name="experience" defaultValue={submitted(state.values, "experience", application.experience)} />
          </Field>
          <Field label="Education or training">
            <Textarea name="education" defaultValue={submitted(state.values, "education", application.education)} />
          </Field>
        </div>

        <Field label="Previous entrepreneurial experience" hint="Other businesses you have run, successful or not">
          <Textarea name="priorVenture" defaultValue={submitted(state.values, "priorVenture", application.priorVenture)} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Why do you want to join?" required error={state.errors?.motivation}>
            <Textarea name="motivation" defaultValue={submitted(state.values, "motivation", application.motivation)} />
          </Field>
          <Field label="What do you want to achieve?" required error={state.errors?.goals}>
            <Textarea name="goals" defaultValue={submitted(state.values, "goals", application.goals)} />
          </Field>
        </div>

        <Field label="How did you hear about the programme?">
          <Select
              key={submitted(state.values, "referralSource", application.referralSource)}
              name="referralSource"
              defaultValue={submitted(state.values, "referralSource", application.referralSource)}
            >
            <option value="">Select</option>
            {["Radio", "Community information session", "Social media", "Friend or family", "Assembly member", "Church or mosque", "Other"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </Select>
        </Field>

        <Actions onBack={onBack} pending={pending} />
      </form>
    </StepShell>
  );
}

/* --------------------------------------------------------------- step 4 */

function Step4({
  application,
  onBack,
  onDone,
}: {
  application: WizardApplication;
  onBack: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(uploadDocument, {});
  const [removing, startRemoving] = useTransition();

  const byKind = (kind: string) => application.documents.filter((d) => d.kind === kind);
  const hasId = byKind("IDENTIFICATION").length > 0;

  return (
    <StepShell
      title="Documents"
      lead="Identification is required. Everything else strengthens your application but is optional."
    >
      <div className="space-y-6">
        {state.message && (
          <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
        )}

        <div className="space-y-3">
          {DOCUMENT_TYPES.map((type) => {
            const files = byKind(type.kind);
            return (
              <div key={type.kind} className="rounded-2xl border border-ink-900/8 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-bold text-ink-900">
                      {type.label}
                      {type.required && <span className="ml-1.5 text-brandred">*</span>}
                    </p>
                    <p className="mt-1 text-[0.85rem] text-ink-500">{type.hint}</p>
                  </div>

                  <form action={action} className="flex items-center gap-2">
                    <input type="hidden" name="kind" value={type.kind} />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-900/15 px-4 py-2 text-[0.85rem] font-medium text-ink-900 transition-colors hover:border-lime-500 hover:bg-lime-50">
                      <CloudUpload className="h-4 w-4" />
                      Choose file
                      <input
                        type="file"
                        name="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      />
                    </label>
                    {pending && <Loader2 className="h-4 w-4 animate-spin text-lime-600" />}
                  </form>
                </div>

                {files.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-ink-900/8 pt-4">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center gap-3 rounded-xl bg-lime-50 px-4 py-2.5"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-lime-700" />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 flex-1 truncate text-[0.85rem] font-medium text-ink-900 hover:underline"
                        >
                          {file.fileName}
                        </a>
                        <span className="shrink-0 text-[0.75rem] text-ink-500">
                          {file.size ? `${Math.round(file.size / 1024)} KB` : ""}
                        </span>
                        <button
                          type="button"
                          disabled={removing}
                          onClick={() => startRemoving(() => void removeDocument(file.id))}
                          aria-label={`Remove ${file.fileName}`}
                          className="shrink-0 text-ink-500 transition-colors hover:text-brandred"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {!hasId && (
          <FormMessage tone="error">
            Upload a form of identification before you submit. You can continue to the review step
            and come back.
          </FormMessage>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/8 pt-8">
          <Button type="button" variant="ghost" onClick={onBack} size="lg">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="button" size="lg" onClick={onDone} className="ml-auto">
            Continue to review
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepShell>
  );
}

/* --------------------------------------------------------------- step 5 */

function Step5({
  application,
  fullName,
  onBack,
  onJump,
  onSubmitted,
}: {
  application: WizardApplication;
  fullName: string;
  onBack: () => void;
  onJump: (n: number) => void;
  onSubmitted: (reference: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitApplication, {});

  useEffect(() => {
    if (state.ok && state.message) onSubmitted(state.message);
  }, [state, onSubmitted]);

  const cluster = CLUSTERS[CLUSTER_KEYS.indexOf(application.cluster as never)];

  const sections = [
    {
      step: 1,
      title: "Your details",
      rows: [
        ["Name", fullName],
        ["Date of birth", application.dateOfBirth?.slice(0, 10) ?? "—"],
        ["Gender", application.gender ?? "—"],
        ["Community", application.community ?? "—"],
        ["Cluster", cluster?.name ?? "—"],
      ],
    },
    {
      step: 2,
      title: "Your business",
      rows: [
        ["Business name", application.businessName ?? "—"],
        ["Location", application.businessLocation ?? "—"],
        ["Stage", application.businessStage ?? "—"],
        ["Monthly revenue", application.monthlyRevenue ?? "—"],
        ["Employees", String(application.employees ?? "—")],
        [
          "Funding requested",
          application.fundingRequired ? ghs(application.fundingRequired) : "—",
        ],
      ],
    },
    {
      step: 3,
      title: "About you",
      rows: [
        ["Background", truncate(application.founderBackground)],
        ["Motivation", truncate(application.motivation)],
        ["Goals", truncate(application.goals)],
      ],
    },
    {
      step: 4,
      title: "Documents",
      rows: [["Uploaded", `${application.documents.length} file(s)`]],
    },
  ];

  return (
    <StepShell
      title="Review & submit"
      lead="Check everything below. Once you submit, the application is locked for review."
    >
      <form action={action} className="space-y-6">
        {state.message && !state.ok && <FormMessage tone="error">{state.message}</FormMessage>}

        {sections.map((section) => (
          <div key={section.step} className="rounded-2xl border border-ink-900/8 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display font-bold text-ink-900">{section.title}</h3>
              <button
                type="button"
                onClick={() => onJump(section.step)}
                className="text-[0.82rem] font-semibold text-lime-700 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {section.rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[0.72rem] font-semibold tracking-wide text-ink-500 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-0.5 truncate text-[0.9rem] text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className="space-y-4 rounded-2xl bg-lime-50 p-6">
          <Checkbox
              key={String(wasChecked(state.values, "consentData"))}
            name="consentData"
            defaultChecked={wasChecked(state.values, "consentData")}
            label={
              <>
                I confirm the information in this application is true, and I consent to the
                programme storing and processing it as described in the{" "}
                <Link href="/privacy" className="font-medium text-lime-700 underline">
                  privacy policy
                </Link>
                .
              </>
            }
          />
          {state.errors?.consentData && (
            <p className="text-[0.8rem] font-medium text-brandred">{state.errors.consentData}</p>
          )}

          <Checkbox
              key={String(wasChecked(state.values, "consentPublic"))}
            name="consentPublic"
            defaultChecked={wasChecked(state.values, "consentPublic")}
            label="I consent to my business profile being published in the public entrepreneur directory if I am selected. (Optional — you can change this later.)"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/8 pt-8">
          <Button type="button" variant="ghost" onClick={onBack} size="lg">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="submit" size="lg" disabled={pending} className="ml-auto">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit application
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </StepShell>
  );
}

function truncate(value: string | null, length = 60) {
  if (!value) return "—";
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

/* ------------------------------------------------------------- success */

function Submitted({ reference }: { reference: string }) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-lime-500 text-ink-950">
        <PartyPopper className="h-8 w-8" />
      </span>
      <h2 className="mt-8 font-display text-3xl text-ink-900">Application submitted</h2>
      <p className="mt-4 leading-relaxed text-ink-500">
        Your application is now with the programme team. We have sent a confirmation SMS to the
        number on your account, and you can track the status any time from your dashboard.
      </p>

      <div className="mt-8 rounded-2xl bg-lime-50 px-6 py-5">
        <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-lime-700 uppercase">
          Your reference
        </p>
        <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">{reference}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/portal" size="lg">
          Go to your dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/" variant="outline" size="lg">
          Back to the website
        </Button>
      </div>
    </div>
  );
}
