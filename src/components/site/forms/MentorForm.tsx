"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormMessage, Input, Textarea } from "@/components/ui/Field";
import { submitted, wasCheckedIn } from "@/lib/form-values";
import { submitMentorInterest, type ActionState } from "@/lib/actions/public";
import { CLUSTERS } from "@/lib/programme";

export function MentorForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitMentorInterest,
    {},
  );

  if (state.ok) {
    return <FormMessage tone="ok">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={state.errors?.fullName}>
          <Input name="fullName" defaultValue={submitted(state.values, "fullName")} placeholder="Full name" autoComplete="name" />
        </Field>
        <Field label="Organisation">
          <Input name="organisation" defaultValue={submitted(state.values, "organisation")} placeholder="Where you work" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email address" required error={state.errors?.email}>
          <Input name="email" type="email" defaultValue={submitted(state.values, "email")} placeholder="you@example.com" />
        </Field>
        <Field label="Phone number" error={state.errors?.phone}>
          <Input name="phone" type="tel" defaultValue={submitted(state.values, "phone")} placeholder="024 123 4567" />
        </Field>
      </div>

      <Field
        label="Area of expertise"
        required
        hint="e.g. agro-processing operations, retail finance, product design"
        error={state.errors?.expertise}
      >
        <Input name="expertise" defaultValue={submitted(state.values, "expertise")} placeholder="What can you help a founder with?" />
      </Field>

      <Field label="Preferred clusters" hint="Select any that fit your experience">
        <div className="grid gap-3 sm:grid-cols-2">
          {CLUSTERS.map((cluster) => (
            <Checkbox
              key={cluster.slug}
              name="clusters"
              value={cluster.name}
              defaultChecked={wasCheckedIn(state.values, "clusters", cluster.name)}
              label={cluster.name}
              className="rounded-xl border border-ink-900/10 px-4 py-3"
            />
          ))}
        </div>
      </Field>

      <Field label="Why do you want to mentor?">
        <Textarea name="motivation" defaultValue={submitted(state.values, "motivation")} placeholder="Optional" />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Register as a mentor"}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
