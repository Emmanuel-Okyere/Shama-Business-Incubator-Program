"use server";

import { z } from "zod";
import { formValues } from "@/lib/form-values";
import { prisma, dbConfigured } from "@/lib/db";
import { notifySms } from "@/lib/notify";
import { isValidGhanaPhone, normaliseGhanaPhone } from "@/lib/sms";
import { ENQUIRY_CATEGORIES } from "@/lib/programme";

export interface ActionState {
  /** The rejected submission, echoed back so the form can refill itself. */
  values?: Record<string, string>;
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const phone = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidGhanaPhone(v), {
    message: "Enter a valid Ghanaian mobile number, e.g. 024 123 4567",
  });

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function notConfigured(): ActionState {
  return {
    ok: false,
    message:
      "The database is not connected yet, so this could not be saved. Set DATABASE_URL and try again.",
  };
}

/* ----------------------------------------------------------- enquiries §37 */

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.email("Enter a valid email address"),
  phone,
  category: z.enum(ENQUIRY_CATEGORIES),
  message: z.string().trim().min(10, "Give us a little more detail"),
});

export async function submitEnquiry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };
  if (!dbConfigured()) return notConfigured();

  const data = parsed.data;

  try {
    await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ? normaliseGhanaPhone(data.phone) : null,
        category: data.category,
        message: data.message,
      },
    });
  } catch {
    return { ok: false, message: "Something went wrong saving your enquiry. Please try again." };
  }

  if (data.phone) {
    await notifySms({
      to: data.phone,
      template: "enquiry_ack",
      vars: { name: data.name.split(" ")[0], category: data.category },
    });
  }

  return {
    ok: true,
    message: `Thank you ${data.name.split(" ")[0]} — your ${data.category.toLowerCase()} enquiry has been received. The team responds within 2 working days.`,
  };
}

/* --------------------------------------------------- sponsor enquiry §23 */

const sponsorSchema = z.object({
  organisation: z.string().trim().min(2, "Enter your organisation name"),
  contactPerson: z.string().trim().min(2, "Enter a contact person"),
  email: z.email("Enter a valid email address"),
  phone,
  orgType: z.string().trim().optional(),
  interest: z.string().trim().optional(),
  level: z.string().trim().optional(),
  category: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export async function submitSponsorInterest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sponsorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };
  if (!dbConfigured()) return notConfigured();

  const data = parsed.data;

  try {
    await prisma.partnerLead.create({
      data: {
        organisation: data.organisation,
        contactPerson: data.contactPerson,
        email: data.email.toLowerCase(),
        phone: data.phone ? normaliseGhanaPhone(data.phone) : null,
        orgType: data.orgType || null,
        interest: data.interest || null,
        level: data.level || null,
        category: data.category || "Corporate & Institutional Partners",
        message: data.message || null,
        stage: "PROSPECT",
      },
    });
  } catch {
    return { ok: false, message: "Something went wrong. Please try again or email us directly." };
  }

  return {
    ok: true,
    message:
      "Thank you. Your partnership enquiry has reached the programme team — expect a response within 2 working days.",
  };
}

/* ------------------------------------------------- mentor interest §17.1 */

const mentorSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phone,
  organisation: z.string().trim().optional(),
  expertise: z.string().trim().min(3, "Tell us your area of expertise"),
  motivation: z.string().trim().optional(),
});

export async function submitMentorInterest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = mentorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };
  if (!dbConfigured()) return notConfigured();

  const data = parsed.data;
  const clusters = formData.getAll("clusters").map(String);

  try {
    await prisma.mentorInterest.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone ? normaliseGhanaPhone(data.phone) : null,
        organisation: data.organisation || null,
        expertise: data.expertise,
        motivation: data.motivation || null,
        clusters,
      },
    });
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return {
    ok: true,
    message:
      "Thank you for volunteering. The programme team will be in touch about mentor onboarding and matching.",
  };
}

/* ------------------------------------------------------- interest list */

const interestSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().refine(isValidGhanaPhone, {
    message: "Enter a valid Ghanaian mobile number, e.g. 024 123 4567",
  }),
  cluster: z.string().trim().optional(),
});

export async function joinInterestList(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = interestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };
  if (!dbConfigured()) return notConfigured();

  const data = parsed.data;

  try {
    await prisma.enquiry.create({
      data: {
        name: data.fullName,
        email: data.email.toLowerCase(),
        phone: normaliseGhanaPhone(data.phone),
        category: "Application",
        message: `Interest list registration${data.cluster ? ` — cluster: ${data.cluster}` : ""}`,
      },
    });
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return {
    ok: true,
    message:
      "You are on the list. We will text you the moment applications open for the next cohort.",
  };
}
