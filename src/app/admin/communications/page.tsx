import type { Metadata } from "next";
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { checkSmsBalance } from "@/lib/actions/admin";
import { prisma, safeQuery } from "@/lib/db";
import { SMS_TEMPLATES } from "@/lib/notify";
import { SENDER_ID, smsConfigured } from "@/lib/sms";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Communications",
  robots: { index: false, follow: false },
};

export default async function CommunicationsPage() {
  const configured = smsConfigured();
  const balance = configured ? await checkSmsBalance() : null;

  const [log, stats] = await Promise.all([
    safeQuery(
      () =>
        prisma.notification.findMany({
          where: { channel: "SMS" },
          orderBy: { createdAt: "desc" },
          take: 40,
        }),
      [],
    ),
    safeQuery(
      async () => ({
        sent: await prisma.notification.count({ where: { channel: "SMS", status: "SENT" } }),
        failed: await prisma.notification.count({ where: { channel: "SMS", status: "FAILED" } }),
      }),
      { sent: 0, failed: 0 },
    ),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Communications centre
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">SMS</h1>
        <p className="mt-2 text-ink-500">
          Delivered through GiantSMS as sender ID{" "}
          <strong className="text-ink-900">{SENDER_ID}</strong>.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Messages delivered"
          value={stats.sent.toLocaleString("en-GB")}
          tone="good"
        />
        <Stat
          label="Failed"
          value={stats.failed.toLocaleString("en-GB")}
          tone={stats.failed > 0 ? "bad" : "neutral"}
        />
        <Stat
          label="Account balance"
          value={balance?.ok ? String(balance.message) : "Unavailable"}
          tone={balance?.ok ? "good" : "neutral"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
          <h2 className="font-display text-lg text-ink-900">Send a broadcast</h2>
          <p className="mt-1.5 mb-6 text-[0.88rem] text-ink-500">
            One message to a targeted audience. Recipients are de-duplicated automatically.
          </p>
          <BroadcastForm configured={configured} />
        </section>

        <section className="rounded-3xl border border-ink-900/8 bg-white p-7">
          <h2 className="font-display text-lg text-ink-900">Automatic notifications</h2>
          <p className="mt-1.5 mb-6 text-[0.88rem] text-ink-500">
            These templates fire on programme events. Placeholders in{" "}
            <code className="rounded bg-ink-900/5 px-1.5 py-0.5 text-[0.8rem]">{"{{braces}}"}</code>{" "}
            are filled from the applicant record.
          </p>
          <ul className="space-y-3">
            {Object.entries(SMS_TEMPLATES).map(([key, template]) => (
              <li key={key} className="rounded-xl bg-lime-50 p-4">
                <p className="text-[0.8rem] font-semibold text-ink-900">{template.name}</p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-500">{template.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
        <div className="border-b border-ink-900/8 px-7 py-5">
          <h2 className="font-display text-lg text-ink-900">Message log</h2>
        </div>

        {log.length === 0 ? (
          <div className="px-7 py-16 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-ink-500/40" />
            <p className="mt-4 text-[0.9rem] text-ink-500">No SMS sent yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-900/6">
            {log.map((entry) => (
              <li key={entry.id} className="flex items-start gap-4 px-7 py-4">
                {entry.status === "SENT" ? (
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-lime-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[0.88rem] leading-relaxed text-ink-900">{entry.body}</p>
                  <p className="mt-1.5 text-[0.75rem] text-ink-500">
                    {entry.to} · {entry.template ?? "manual"} · {formatDateTime(entry.createdAt)}
                    {entry.error ? ` · ${entry.error}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "bad" | "neutral";
}) {
  return (
    <div className="rounded-3xl border border-ink-900/8 bg-white p-6">
      <p className="text-[0.75rem] font-medium text-ink-500">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl font-bold",
          tone === "good" && "text-lime-700",
          tone === "bad" && "text-brandred",
          tone === "neutral" && "text-ink-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
