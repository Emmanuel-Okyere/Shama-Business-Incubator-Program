"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApplicationStatus, PipelineStage } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { broadcastSms, notifySms, type TemplateKey } from "@/lib/notify";
import { setSetting, SETTING_DEFAULTS, type SettingKey } from "@/lib/settings";
import { getBalance, smsConfigured, smsSegments } from "@/lib/sms";

export interface AdminState {
  /** The rejected submission, echoed back so the form can refill itself. */
  values?: Record<string, string>;
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/** Status changes that automatically text the applicant (PRD §35). */
const STATUS_SMS: Partial<Record<ApplicationStatus, TemplateKey>> = {
  SHORTLISTED: "application_shortlisted",
  INTERVIEW: "application_interview",
  SELECTED: "application_selected",
  NOT_SELECTED: "application_not_selected",
};

async function audit(actorId: string, action: string, entity: string, entityId?: string, meta?: unknown) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId: entityId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (error) {
    console.error("[audit] failed:", (error as Error).message);
  }
}

/* ------------------------------------------------------ status changes */

const statusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "NOT_SELECTED",
    "WITHDRAWN",
  ]),
  notify: z.string().optional(),
});

export async function updateApplicationStatus(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Invalid status change." };

  const { applicationId, status } = parsed.data;
  const sendSms = parsed.data.notify === "on";

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      decidedAt: ["SELECTED", "NOT_SELECTED"].includes(status) ? new Date() : undefined,
    },
    include: { user: true, cohort: true },
  });

  await audit(admin.id, "application.status", "Application", applicationId, { status });

  let smsNote = "";
  const template = STATUS_SMS[status];
  if (sendSms && template && application.user.phone) {
    const result = await notifySms({
      to: application.user.phone,
      userId: application.userId,
      template,
      vars: {
        name: application.user.fullName.split(" ")[0],
        reference: application.reference,
        cohort: application.cohort.name,
      },
    });
    smsNote = result.ok ? " Applicant notified by SMS." : ` SMS not sent (${result.reason}).`;
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true, message: `Status set to ${status.replace(/_/g, " ").toLowerCase()}.${smsNote}` };
}

/* --------------------------------------------------------------- notes */

export async function addNote(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const applicationId = String(formData.get("applicationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!applicationId || body.length < 2) {
    return { ok: false, message: "Write a note before saving." };
  }

  await prisma.note.create({
    data: { applicationId, authorName: admin.fullName, body },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true, message: "Note added." };
}

/* ------------------------------------------------------------- scoring */

export async function saveReview(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const applicationId = String(formData.get("applicationId") ?? "");
  if (!applicationId) return { ok: false, message: "Missing application." };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { cohortId: true },
  });
  if (!application) return { ok: false, message: "Application not found." };

  const criteria = await prisma.scoringCriterion.findMany({
    where: { cohortId: application.cohortId },
    orderBy: { order: "asc" },
  });

  const values = criteria.map((criterion) => {
    const raw = Number(formData.get(`score_${criterion.id}`));
    const value = Number.isFinite(raw)
      ? Math.min(criterion.maxScore, Math.max(0, Math.round(raw)))
      : 0;
    return { criterion, value };
  });

  const weightTotal = criteria.reduce((sum, c) => sum + c.weight, 0) || 1;
  const total =
    values.reduce(
      (sum, { criterion, value }) => sum + (value / criterion.maxScore) * criterion.weight,
      0,
    ) *
    (100 / weightTotal);

  const review = await prisma.review.upsert({
    where: { applicationId_reviewerId: { applicationId, reviewerId: admin.id } },
    update: {
      comment: String(formData.get("comment") ?? "") || null,
      total: Math.round(total * 10) / 10,
      submittedAt: new Date(),
    },
    create: {
      applicationId,
      reviewerId: admin.id,
      comment: String(formData.get("comment") ?? "") || null,
      total: Math.round(total * 10) / 10,
      submittedAt: new Date(),
    },
  });

  for (const { criterion, value } of values) {
    await prisma.score.upsert({
      where: { reviewId_criterionId: { reviewId: review.id, criterionId: criterion.id } },
      update: { value },
      create: { reviewId: review.id, criterionId: criterion.id, value },
    });
  }

  // A scored application is, by definition, under review.
  await prisma.application.updateMany({
    where: { id: applicationId, status: "SUBMITTED" },
    data: { status: "UNDER_REVIEW" },
  });

  await audit(admin.id, "application.score", "Application", applicationId, { total: review.total });

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
  return { ok: true, message: `Score saved: ${review.total.toFixed(1)}/100.` };
}

/* ------------------------------------------------ communications centre */

export async function sendBroadcast(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const audience = String(formData.get("audience") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < 5) return { ok: false, message: "Write a message first." };
  if (message.length > 640) {
    return { ok: false, message: "Keep broadcasts under 640 characters (4 SMS segments)." };
  }

  const recipients = await recipientsFor(audience);
  if (recipients.length === 0) {
    return { ok: false, message: "That audience has no reachable phone numbers." };
  }

  const result = await broadcastSms(recipients, message);
  await audit(admin.id, "sms.broadcast", "Notification", undefined, {
    audience,
    count: recipients.length,
  });

  revalidatePath("/admin/communications");

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "not_configured"
          ? "GiantSMS is not configured. Add GIANTSMS_API_TOKEN to send messages."
          : `Broadcast failed: ${result.reason}`,
    };
  }

  const { parts } = smsSegments(message);
  return {
    ok: true,
    message: `Queued to ${result.count} recipient(s) at ${parts} SMS segment(s) each — about ${result.count * parts} credits.`,
  };
}

async function recipientsFor(audience: string): Promise<string[]> {
  const phones = (rows: { phone: string | null }[]) =>
    rows.map((r) => r.phone).filter((p): p is string => Boolean(p));

  switch (audience) {
    case "applicants": {
      const rows = await prisma.user.findMany({
        where: { role: "APPLICANT", applications: { some: { status: { not: "DRAFT" } } } },
        select: { phone: true },
      });
      return phones(rows);
    }
    case "shortlisted": {
      const rows = await prisma.user.findMany({
        where: { applications: { some: { status: "SHORTLISTED" } } },
        select: { phone: true },
      });
      return phones(rows);
    }
    case "selected": {
      const rows = await prisma.user.findMany({
        where: { applications: { some: { status: "SELECTED" } } },
        select: { phone: true },
      });
      return phones(rows);
    }
    case "participants": {
      const rows = await prisma.user.findMany({
        where: { participant: { isNot: null } },
        select: { phone: true },
      });
      return phones(rows);
    }
    case "mentors": {
      const rows = await prisma.mentor.findMany({ select: { phone: true } });
      return phones(rows);
    }
    case "interest": {
      const rows = await prisma.enquiry.findMany({
        where: { category: "Application" },
        select: { phone: true },
      });
      return phones(rows);
    }
    default:
      return [];
  }
}

export async function checkSmsBalance(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  if (!smsConfigured()) {
    return { ok: false, message: "GiantSMS is not configured." };
  }
  try {
    const res = await getBalance();
    return res.status
      ? { ok: true, message: `${res.message} credits remaining` }
      : { ok: false, message: String(res.message) };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

/* ------------------------------------------------------------ settings */

export async function updateSettings(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];

  for (const key of keys) {
    if (!formData.has(key)) {
      // Unchecked checkboxes are absent from FormData.
      if (key === "applications_open") await setSetting(key, "false");
      continue;
    }
    const value = String(formData.get(key) ?? "").trim();
    await setSetting(key, key === "applications_open" ? "true" : value);
  }

  await audit(admin.id, "settings.update", "Setting");

  revalidatePath("/", "layout");
  return { ok: true, message: "Programme settings saved and published to the website." };
}

/* --------------------------------------------------- partner pipeline */

export async function updateLeadStage(leadId: string, stage: PipelineStage) {
  await requireAdmin();
  await prisma.partnerLead.update({
    where: { id: leadId },
    data: { stage, lastContactAt: new Date() },
  });
  revalidatePath("/admin/partners");
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: "NEW" | "IN_PROGRESS" | "RESOLVED",
) {
  await requireAdmin();
  await prisma.enquiry.update({ where: { id: enquiryId }, data: { status } });
  revalidatePath("/admin/enquiries");
}
