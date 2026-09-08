"use client";

import { useActionState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, Input, Select } from "@/components/ui/Field";
import { submitted } from "@/lib/form-values";
import { joinInterestList, type ActionState } from "@/lib/actions/public";
import { CLUSTERS } from "@/lib/programme";

export function InterestForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(joinInterestList, {});

  if (state.ok) {
    return <FormMessage tone="ok">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <Field label="Full name" required error={state.errors?.fullName}>
        <Input name="fullName" defaultValue={submitted(state.values, "fullName")} placeholder="Your full name" autoComplete="name" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email address" required error={state.errors?.email}>
          <Input name="email" type="email" defaultValue={submitted(state.values, "email")} placeholder="you@example.com" />
        </Field>
        <Field
          label="Mobile number"
          required
          hint="This is where we text you"
          error={state.errors?.phone}
        >
          <Input name="phone" type="tel" defaultValue={submitted(state.values, "phone")} placeholder="024 123 4567" />
        </Field>
      </div>

      <Field label="Cluster you would apply to">
        <Select
              key={submitted(state.values, "cluster")}
              name="cluster"
              defaultValue={submitted(state.values, "cluster")}
            >
          <option value="">Not sure yet</option>
          {CLUSTERS.map((c) => (
            <option key={c.slug}>{c.name}</option>
          ))}
        </Select>
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Adding you…" : "Notify me when applications open"}
        <BellRing className="h-4 w-4" />
      </Button>
    </form>
  );
}
