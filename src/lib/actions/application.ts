"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { DocumentKind } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { formValues } from "@/lib/form-values";
import { prisma } from "@/lib/db";
import { notifySms } from "@/lib/notify";
import { storeFile, UploadError, deleteFile } from "@/lib/storage";
import { applicationReference } from "@/lib/utils";

export interface ActionState {
  /** The rejected submission, echoed back so the form can refill itself. */
  values?: Record<string, string>;
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  step?: number;
}

const CLUSTER_KEYS = [
  "CREATIVE_CRAFT",
  "AGRIC_AGRIBUSINESS",
  "FISHERIES_AQUACULTURE",
  "TECH_INNOVATION",
] as const;

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** The applicant's draft for the active cohort, created on first visit. */
export async function getOrCreateApplication(userId: string) {
  const cohort =
    (await prisma.cohort.findFirst({ where: { isActive: true } })) ??
    (await prisma.cohort.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!cohort) throw new Error("NO_COHORT");

  const existing = await prisma.application.findFirst({
    where: { userId, cohortId: cohort.id },
    include: { documents: true, cohort: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const created = await prisma.application.create({
    data: {
      userId,
      cohortId: cohort.id,
      reference: applicationReference(`C${cohort.year % 100}`),
    },
    include: { documents: true, cohort: true },
  });
  return created;
}

async function draftFor(userId: string) {
  const application = await getOrCreateApplication(userId);
  if (application.status !== "DRAFT") throw new Error("ALREADY_SUBMITTED");
  return application;
}

/* --------------------------------------------------------------- step 1 */

const step1 = z.object({
  dateOfBirth: z.string().min(1, "Enter your date of birth"),
  gender: z.string().min(1, "Select an option"),
  community: z.string().trim().min(2, "Which community do you live in?"),
  cluster: z.enum(CLUSTER_KEYS),
  eligibility: z.literal("on", { message: "You must confirm you meet the criteria" }),
});

export async function saveStep1(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = step1.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData), step: 1 };

  const dob = new Date(parsed.data.dateOfBirth);
  const age = Math.floor((Date.now() - dob.getTime()) / 31_557_600_000);
  if (age < 18 || age > 35) {
    return {
      ok: false,
      step: 1,
      errors: { dateOfBirth: `The programme is for ages 18–35. Your age is ${age}.` },
      values: formValues(formData),
    };
  }

  const application = await draftFor(user.id);
  await prisma.application.update({
    where: { id: application.id },
    data: {
      dateOfBirth: dob,
      gender: parsed.data.gender,
      community: parsed.data.community,
      cluster: parsed.data.cluster,
      eligibility: true,
      currentStep: Math.max(application.currentStep, 2),
    },
  });

  revalidatePath("/apply/start");
  return { ok: true, step: 2 };
}

/* --------------------------------------------------------------- step 2 */

const step2 = z.object({
  businessName: z.string().trim().min(2, "Enter your business name"),
  businessLocation: z.string().trim().min(2, "Where does the business operate?"),
  registrationStatus: z.enum(["NOT_REGISTERED", "IN_PROGRESS", "REGISTERED"]),
  businessStage: z.enum(["IDEA", "EARLY_STAGE", "OPERATING", "GROWING"]),
  businessDescription: z.string().trim().min(40, "Describe the business in at least 40 characters"),
  problemSolved: z.string().trim().min(20, "What problem does it solve?"),
  productService: z.string().trim().min(10, "What do you sell?"),
  targetMarket: z.string().trim().min(10, "Who are your customers?"),
  currentCustomers: z.string().trim().optional(),
  monthlyRevenue: z.string().trim().optional(),
  employees: z.coerce.number().int().min(0).max(10000).optional(),
  yearsOperating: z.coerce.number().min(0).max(60).optional(),
  challenges: z.string().trim().min(20, "What is holding the business back?"),
  growthPlans: z.string().trim().min(20, "Where do you want the business to be?"),
  fundingRequired: z.coerce.number().int().min(0).max(1_000_000).optional(),
  fundingUse: z.string().trim().min(20, "What exactly would the funding be spent on?"),
});

export async function saveStep2(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData);
  const parsed = step2.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData), step: 2 };

  const application = await draftFor(user.id);
  await prisma.application.update({
    where: { id: application.id },
    data: {
      ...parsed.data,
      currentCustomers: parsed.data.currentCustomers || null,
      monthlyRevenue: parsed.data.monthlyRevenue || null,
      currentStep: Math.max(application.currentStep, 3),
    },
  });

  revalidatePath("/apply/start");
  return { ok: true, step: 3 };
}

/* --------------------------------------------------------------- step 3 */

const step3 = z.object({
  founderBackground: z.string().trim().min(30, "Tell us about yourself in at least 30 characters"),
  experience: z.string().trim().min(20, "What relevant experience do you have?"),
  education: z.string().trim().optional(),
  priorVenture: z.string().trim().optional(),
  motivation: z.string().trim().min(30, "Why do you want to join?"),
  goals: z.string().trim().min(20, "What do you want to get out of the programme?"),
  referralSource: z.string().trim().optional(),
});

export async function saveStep3(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = step3.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData), step: 3 };

  const application = await draftFor(user.id);
  await prisma.application.update({
    where: { id: application.id },
    data: {
      ...parsed.data,
      education: parsed.data.education || null,
      priorVenture: parsed.data.priorVenture || null,
      referralSource: parsed.data.referralSource || null,
      currentStep: Math.max(application.currentStep, 4),
    },
  });

  revalidatePath("/apply/start");
  return { ok: true, step: 4 };
}

/* ---------------------------------------------------------- documents */

const DOCUMENT_KINDS = [
  "IDENTIFICATION",
  "BUSINESS_REGISTRATION",
  "PITCH_DECK",
  "BUSINESS_PLAN",
  "PRODUCT_IMAGES",
  "FINANCIAL_INFO",
  "OTHER",
] as const;

export async function uploadDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");

  if (!DOCUMENT_KINDS.includes(kind as (typeof DOCUMENT_KINDS)[number])) {
    return { ok: false, message: "Unknown document type.", step: 4 };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload.", step: 4 };
  }

  const application = await draftFor(user.id);

  try {
    const stored = await storeFile(file, `applications/${application.id}`);
    await prisma.document.create({
      data: {
        applicationId: application.id,
        kind: kind as DocumentKind,
        fileName: stored.fileName,
        url: stored.url,
        contentType: stored.contentType,
        size: stored.size,
      },
    });
  } catch (error) {
    return {
      ok: false,
      step: 4,
      message:
        error instanceof UploadError
          ? error.message
          : "That upload failed. Please try again.",
    };
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { currentStep: Math.max(application.currentStep, 4) },
  });

  revalidatePath("/apply/start");
  return { ok: true, step: 4, message: `${file.name} uploaded.` };
}

export async function removeDocument(documentId: string) {
  const user = await requireUser();
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { application: true },
  });
  if (!document || document.application.userId !== user.id) return;
  if (document.application.status !== "DRAFT") return;

  await deleteFile(document.url);
  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath("/apply/start");
}

export async function goToStep(step: number) {
  const user = await requireUser();
  const application = await draftFor(user.id);
  await prisma.application.update({
    where: { id: application.id },
    data: { currentStep: Math.min(5, Math.max(1, step)) },
  });
  revalidatePath("/apply/start");
}

/* ----------------------------------------------------------- submission */

export async function submitApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  if (formData.get("consentData") !== "on") {
    return {
      ok: false,
      step: 5,
      errors: { consentData: "Consent is required to submit." },
      values: formValues(formData),
    };
  }

  const application = await prisma.application.findFirst({
    where: { userId: user.id },
    include: { documents: true, cohort: true },
    orderBy: { createdAt: "desc" },
  });
  if (!application) return { ok: false, step: 5, message: "No application found." };
  if (application.status !== "DRAFT") {
    return { ok: false, step: 5, message: "This application has already been submitted." };
  }

  const missing = requiredMissing(application);
  if (missing.length > 0) {
    return {
      ok: false,
      step: 5,
      message: `Complete these before submitting: ${missing.join(", ")}.`,
    };
  }

  await prisma.application.update({
    where: { id: application.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      currentStep: 5,
      consentData: true,
      consentPublic: formData.get("consentPublic") === "on",
    },
  });

  const account = await prisma.user.findUnique({ where: { id: user.id } });
  if (account?.phone) {
    await notifySms({
      to: account.phone,
      userId: user.id,
      template: "application_submitted",
      vars: {
        name: user.fullName.split(" ")[0],
        reference: application.reference,
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/portal`,
      },
    });
  }

  // Deliberately not revalidating /apply/start: that page redirects a
  // non-draft application to /portal, which would replace the confirmation
  // screen (and the applicant's reference number) before they could read it.
  revalidatePath("/portal");
  return { ok: true, step: 5, message: application.reference };
}

type ApplicationLike = {
  cluster: unknown;
  community: unknown;
  businessName: unknown;
  businessDescription: unknown;
  fundingUse: unknown;
  founderBackground: unknown;
  motivation: unknown;
  eligibility: boolean;
};

function requiredMissing(application: ApplicationLike): string[] {
  const missing: string[] = [];
  if (!application.eligibility || !application.cluster || !application.community) {
    missing.push("your details");
  }
  if (!application.businessName || !application.businessDescription || !application.fundingUse) {
    missing.push("business information");
  }
  if (!application.founderBackground || !application.motivation) {
    missing.push("founder information");
  }
  return missing;
}
