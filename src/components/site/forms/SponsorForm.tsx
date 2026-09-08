"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/Field";
import { submitted } from "@/lib/form-values";
import { submitSponsorInterest, type ActionState } from "@/lib/actions/public";
import { PARTNER_CATEGORIES, SPONSOR_LEVELS, ghs } from "@/lib/programme";

export function SponsorForm({ defaultLevel }: { defaultLevel?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitSponsorInterest,
    {},
  );

  if (state.ok) {
    return <FormMessage tone="ok">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation" required error={state.errors?.organisation}>
          <Input name="organisation" defaultValue={submitted(state.values, "organisation")} placeholder="Organisation name" />
        </Field>
        <Field label="Contact person" required error={state.errors?.contactPerson}>
          <Input name="contactPerson" defaultValue={submitted(state.values, "contactPerson")} placeholder="Full name" autoComplete="name" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email address" required error={state.errors?.email}>
          <Input name="email" type="email" defaultValue={submitted(state.values, "email")} placeholder="you@organisation.com" />
        </Field>
        <Field label="Phone number" error={state.errors?.phone}>
          <Input name="phone" type="tel" defaultValue={submitted(state.values, "phone")} placeholder="024 123 4567" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation type">
          <Select
              key={submitted(state.values, "orgType")}
              name="orgType"
              defaultValue={submitted(state.values, "orgType")}
            >
            <option value="">Select type</option>
            {[
              "Corporate",
              "Financial institution",
              "Development partner",
              "Government agency",
              "Foundation / NGO",
              "Individual",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Partner category">
          <Select
              key={submitted(state.values, "category", PARTNER_CATEGORIES[0].name)}
              name="category"
              defaultValue={submitted(state.values, "category", PARTNER_CATEGORIES[0].name)}
            >
            {PARTNER_CATEGORIES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sponsorship interest">
          <Select
              key={submitted(state.values, "interest")}
              name="interest"
              defaultValue={submitted(state.values, "interest")}
            >
            <option value="">Select interest</option>
            {[
              "Fund a cluster",
              "General programme funding",
              "Provide mentors",
              "Provide training",
              "In-kind support",
              "Still exploring",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Sponsorship level">
          <Select
              key={submitted(state.values, "level", defaultLevel ?? "")}
              name="level"
              defaultValue={submitted(state.values, "level", defaultLevel ?? "")}
            >
            <option value="">Select level</option>
            {SPONSOR_LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {l.level} — {ghs(l.amount)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Message">
        <Textarea name="message" defaultValue={submitted(state.values, "message")} placeholder="Anything you would like the team to know" />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Submit partnership enquiry"}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
