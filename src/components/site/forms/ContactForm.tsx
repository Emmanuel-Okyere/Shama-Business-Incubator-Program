"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/Field";
import { submitted } from "@/lib/form-values";
import { submitEnquiry, type ActionState } from "@/lib/actions/public";
import { ENQUIRY_CATEGORIES } from "@/lib/programme";

export function ContactForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return <FormMessage tone="ok">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={state.errors?.name}>
          <Input name="name" defaultValue={submitted(state.values, "name")} placeholder="Ama Mensah" autoComplete="name" />
        </Field>
        <Field label="Email address" required error={state.errors?.email}>
          <Input name="email" type="email" defaultValue={submitted(state.values, "email")} placeholder="you@example.com" autoComplete="email" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone number" hint="We send updates by SMS" error={state.errors?.phone}>
          <Input name="phone" type="tel" defaultValue={submitted(state.values, "phone")} placeholder="024 123 4567" autoComplete="tel" />
        </Field>
        <Field label="Enquiry category" required error={state.errors?.category}>
          <Select
              key={submitted(state.values, "category", "General Enquiry")}
              name="category"
              defaultValue={submitted(state.values, "category", "General Enquiry")}
            >
            {ENQUIRY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Message" required error={state.errors?.message}>
        <Textarea name="message" rows={5} defaultValue={submitted(state.values, "message")} placeholder="How can the programme team help?" />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send enquiry"}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
