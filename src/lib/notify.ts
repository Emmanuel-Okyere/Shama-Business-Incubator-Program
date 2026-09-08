import "server-only";
import { prisma } from "@/lib/db";
import {
  normaliseGhanaPhone,
  sendBulk,
  sendMessage,
  smsConfigured,
  smsSegments,
} from "@/lib/sms";

/**
 * Programme SMS templates (PRD §35). Bodies are kept short and inside one
 * GSM-7 segment wherever possible — every extra segment is a real cost against
 * the programme's credit balance.
 */
export const SMS_TEMPLATES = {
  application_submitted: {
    name: "Application submitted",
    body: "Shama Business Incubator: Thank you {{name}}. Your application {{reference}} has been received. Track it at {{url}}",
  },
  application_shortlisted: {
    name: "Shortlisted",
    body: "Shama Business Incubator: Good news {{name}} — application {{reference}} has been SHORTLISTED. We will contact you about the next stage.",
  },
  application_interview: {
    name: "Interview invitation",
    body: "Shama Business Incubator: {{name}}, you are invited to an assessment interview for {{reference}}. Details to follow. Keep your phone on.",
  },
  application_selected: {
    name: "Selected for the cohort",
    body: "Shama Business Incubator: Congratulations {{name}}! You have been SELECTED for {{cohort}}. Onboarding details coming shortly.",
  },
  application_not_selected: {
    name: "Not selected",
    body: "Shama Business Incubator: {{name}}, thank you for applying. You were not selected for {{cohort}} this time. We will alert you about the next cohort.",
  },
  session_reminder: {
    name: "Session reminder",
    body: "Shama Incubator reminder: {{session}} on {{date}} at {{location}}. Attendance is tracked. See you there.",
  },
  deadline_reminder: {
    name: "Deadline reminder",
    body: "Shama Incubator: {{item}} is due {{date}}. Submit from your dashboard: {{url}}",
  },
  pitch_notice: {
    name: "Pitch notice",
    body: "Shama Incubator: Your {{pitch}} slot is {{date}} at {{location}}. Bring your deck and arrive 30 minutes early.",
  },
  funding_award: {
    name: "Funding award",
    body: "Shama Business Incubator: Congratulations {{name}} — {{business}} has been awarded {{amount}}. The team will contact you about disbursement.",
  },
  enquiry_ack: {
    name: "Enquiry acknowledgement",
    body: "Shama Business Incubator: Thanks {{name}}, we have received your {{category}} enquiry and will respond within 2 working days.",
  },
} as const;

export type TemplateKey = keyof typeof SMS_TEMPLATES;

export function renderTemplate(body: string, vars: Record<string, string | number>) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

interface NotifyArgs {
  to: string;
  template: TemplateKey;
  vars?: Record<string, string | number>;
  userId?: string | null;
}

/**
 * Send a templated SMS and record it. Never throws — a failed notification
 * must not roll back the action that triggered it (an application still
 * submits even if the gateway is down); the failure is persisted instead so
 * admins can see and retry it.
 */
export async function notifySms({ to, template, vars = {}, userId = null }: NotifyArgs) {
  const body = renderTemplate(SMS_TEMPLATES[template].body, vars);
  const phone = normaliseGhanaPhone(to);

  if (!smsConfigured()) {
    console.warn(`[sms] not configured — would send to ${phone}: ${body}`);
    await recordNotification({
      userId, to: phone, body, template,
      status: "FAILED", error: "GiantSMS not configured",
    });
    return { ok: false as const, reason: "not_configured" as const };
  }

  try {
    const res = await sendMessage({ to: phone, msg: body });
    await recordNotification({
      userId, to: phone, body, template,
      status: res.status ? "SENT" : "FAILED",
      providerId: res.data?.message_id,
      error: res.status ? undefined : String(res.message),
    });
    return res.status
      ? { ok: true as const, messageId: res.data?.message_id }
      : { ok: false as const, reason: String(res.message) };
  } catch (error) {
    const message = (error as Error).message;
    await recordNotification({
      userId, to: phone, body, template, status: "FAILED", error: message,
    });
    return { ok: false as const, reason: message };
  }
}

/** Broadcast free-text to many numbers (Communications Centre, PRD §18). */
export async function broadcastSms(recipients: string[], body: string) {
  const numbers = [...new Set(recipients.map(normaliseGhanaPhone))].filter(Boolean);
  if (numbers.length === 0) return { ok: false as const, reason: "no_recipients" as const };

  if (!smsConfigured()) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  try {
    const res = await sendBulk({ recipients: numbers, msg: body });
    await prisma.notification.createMany({
      data: numbers.map((to) => ({
        to,
        body,
        channel: "SMS" as const,
        status: res.status ? ("SENT" as const) : ("FAILED" as const),
        template: "broadcast",
        error: res.status ? null : String(res.message),
        sentAt: res.status ? new Date() : null,
      })),
    });
    return res.status
      ? { ok: true as const, count: numbers.length, segments: smsSegments(body).parts }
      : { ok: false as const, reason: String(res.message) };
  } catch (error) {
    return { ok: false as const, reason: (error as Error).message };
  }
}

async function recordNotification(args: {
  userId?: string | null;
  to: string;
  body: string;
  template: string;
  status: "SENT" | "FAILED" | "QUEUED";
  providerId?: string;
  error?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: args.userId ?? null,
        channel: "SMS",
        status: args.status,
        to: args.to,
        body: args.body,
        template: args.template,
        providerId: args.providerId ?? null,
        error: args.error ?? null,
        sentAt: args.status === "SENT" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[sms] could not record notification:", (error as Error).message);
  }
}
