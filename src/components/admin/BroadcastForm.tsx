"use client";

import { useActionState, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, Select, Textarea } from "@/components/ui/Field";
import { sendBroadcast, type AdminState } from "@/lib/actions/admin";
import { smsSegments } from "@/lib/sms-format";

const AUDIENCES = [
  { value: "applicants", label: "All applicants (submitted)" },
  { value: "shortlisted", label: "Shortlisted applicants" },
  { value: "selected", label: "Selected applicants" },
  { value: "participants", label: "Participants" },
  { value: "mentors", label: "Mentors" },
  { value: "interest", label: "Interest list" },
];

export function BroadcastForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(sendBroadcast, {});
  const [body, setBody] = useState("");

  const { parts, encoding } = smsSegments(body || " ");

  return (
    <form action={action} className="space-y-5">
      {!configured && (
        <FormMessage tone="error">
          GiantSMS is not configured. Add <code>GIANTSMS_API_TOKEN</code> (or{" "}
          <code>GIANTSMS_USERNAME</code> and <code>GIANTSMS_PASSWORD</code>) to your environment,
          then redeploy.
        </FormMessage>
      )}
      {state.message && (
        <FormMessage tone={state.ok ? "ok" : "error"}>{state.message}</FormMessage>
      )}

      <Field label="Audience" required>
        <Select name="audience" defaultValue="applicants">
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Message"
        required
        hint="Plain text only. Keep it short — every segment costs a credit per recipient."
      >
        <Textarea
          name="message"
          rows={5}
          maxLength={640}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Shama Incubator: …"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-lime-50 px-5 py-3.5 text-[0.82rem] text-ink-500">
        <span>
          <strong className="text-ink-900">{body.length}</strong> characters
        </span>
        <span>
          <strong className="text-ink-900">{body ? parts : 0}</strong> SMS segment
          {parts === 1 ? "" : "s"} per recipient
        </span>
        <span>
          Encoding: <strong className="text-ink-900">{encoding}</strong>
        </span>
      </div>

      <Button type="submit" size="lg" disabled={pending || !configured}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Sending…" : "Send broadcast"}
      </Button>
    </form>
  );
}
