"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormMessage, Input } from "@/components/ui/Field";
import { updateSettings, type AdminState } from "@/lib/actions/admin";
import type { Settings } from "@/lib/settings";

const HERO = [
  { key: "hero_headline", label: "Hero headline", type: "text" },
  { key: "applications_close_date", label: "Applications close", type: "date" },
] as const;

const FIGURES = [
  { key: "stat_entrepreneurs", label: "Entrepreneurs" },
  { key: "stat_clusters", label: "Business clusters" },
  { key: "stat_investment_ready", label: "Investment-ready businesses" },
  { key: "stat_funded", label: "Funded businesses" },
  { key: "stat_funding", label: "Grant funding pool (GHS)" },
  { key: "stat_bootcamp_weeks", label: "Bootcamp length (weeks)" },
] as const;

const IMPACT = [
  { key: "impact_trained", label: "Entrepreneurs trained" },
  { key: "impact_supported", label: "Businesses supported" },
  { key: "impact_funded", label: "Businesses funded" },
  { key: "impact_funding_awarded", label: "Total funding awarded (GHS)" },
  { key: "impact_jobs", label: "Jobs created" },
  { key: "impact_still_operating", label: "Businesses still operating" },
  { key: "impact_generating_revenue", label: "Businesses generating revenue" },
  { key: "impact_partnerships", label: "Partnerships secured" },
] as const;

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateSettings, {});

  return (
    <form action={action} className="space-y-6">
      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}

      <Section title="Applications" lead="Controls the call to action across the whole website.">
        <div className="rounded-2xl bg-lime-50 p-6">
          <Checkbox
            name="applications_open"
            defaultChecked={settings.applications_open === "true"}
            label={
              <>
                <strong className="text-ink-900">Applications are open.</strong> When this is off,
                every Apply button becomes an interest-list action instead.
              </>
            }
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {HERO.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input name={field.key} type={field.type} defaultValue={settings[field.key]} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Programme figures" lead="Shown in the homepage counters and hero strip.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIGURES.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input name={field.key} type="number" min={0} defaultValue={settings[field.key]} />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="Impact indicators"
        lead="Published on the public impact dashboard. Update these as the cohort progresses."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input name={field.key} type="number" min={0} defaultValue={settings[field.key]} />
            </Field>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4">
        <Button type="submit" size="lg" disabled={pending} className="shadow-card">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save and publish"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
      <h2 className="font-display text-lg text-ink-900">{title}</h2>
      <p className="mt-1.5 mb-6 text-[0.88rem] text-ink-500">{lead}</p>
      {children}
    </section>
  );
}
