"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { formValues } from "@/lib/form-values";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ContentState {
  /** The rejected submission, echoed back so the form can refill itself. */
  values?: Record<string, string>;
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function fail(error: unknown, formData?: FormData): ContentState {
  const message = (error as Error).message;
  console.error("[admin/content]", error);
  return {
    ok: false,
    values: formData ? formValues(formData) : undefined,
    message: message.includes("Unique constraint")
      ? "Something with that name or slug already exists. Choose another."
      : "That could not be saved. Please try again.",
  };
}

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Enter a valid date");

/* ---------------------------------------------------------------- cohorts */

const cohortSchema = z.object({
  name: z.string().trim().min(2, "Give the cohort a name"),
  year: z.coerce.number().int().min(2020).max(2100),
  seats: z.coerce.number().int().min(1).max(10000),
  opensAt: optionalDate,
  closesAt: optionalDate,
  bootcampStartsAt: optionalDate,
  ultimatePitchAt: optionalDate,
});

export async function saveCohort(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = cohortSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const data = parsed.data;
  const applicationsOpen = formData.get("applicationsOpen") === "on";

  if (data.opensAt && data.closesAt && new Date(data.closesAt) < new Date(data.opensAt)) {
    return {
      ok: false,
      errors: { closesAt: "Applications cannot close before they open." },
      values: formValues(formData),
    };
  }

  const values = {
    name: data.name,
    year: data.year,
    seats: data.seats,
    applicationsOpen,
    opensAt: data.opensAt ? new Date(data.opensAt) : null,
    closesAt: data.closesAt ? new Date(data.closesAt) : null,
    bootcampStartsAt: data.bootcampStartsAt ? new Date(data.bootcampStartsAt) : null,
    ultimatePitchAt: data.ultimatePitchAt ? new Date(data.ultimatePitchAt) : null,
  };

  try {
    if (id) {
      await prisma.cohort.update({ where: { id }, data: values });
    } else {
      const cohort = await prisma.cohort.create({
        data: { ...values, slug: slugify(data.name), isActive: false },
      });

      // A new cohort with no criteria cannot be scored, so give it the
      // programme's standard set rather than leaving reviewers a blank form.
      await prisma.scoringCriterion.createMany({
        data: DEFAULT_CRITERIA.map((c, i) => ({ ...c, cohortId: cohort.id, order: i })),
      });
    }
  } catch (error) {
    return fail(error, formData);
  }

  await audit(admin.id, id ? "cohort.update" : "cohort.create", "Cohort", id || undefined);
  revalidatePath("/admin/cohorts");
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Cohort updated." : "Cohort created with the standard scoring criteria." };
}

/** Exactly one cohort is the live one; activating a cohort retires the others. */
export async function activateCohort(cohortId: string) {
  const admin = await requireAdmin();
  await prisma.$transaction([
    prisma.cohort.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.cohort.update({ where: { id: cohortId }, data: { isActive: true } }),
  ]);
  await audit(admin.id, "cohort.activate", "Cohort", cohortId);
  revalidatePath("/admin/cohorts");
  revalidatePath("/", "layout");
}

export async function deleteCohort(cohortId: string): Promise<ContentState> {
  const admin = await requireAdmin();

  // Applications carry people's submitted work; a cohort that has any is not
  // something to delete by accident.
  const applications = await prisma.application.count({ where: { cohortId } });
  if (applications > 0) {
    return {
      ok: false,
      message: `This cohort has ${applications} application(s) and cannot be deleted. Deactivate it instead.`,
    };
  }

  try {
    await prisma.cohort.delete({ where: { id: cohortId } });
  } catch (error) {
    return fail(error);
  }

  await audit(admin.id, "cohort.delete", "Cohort", cohortId);
  revalidatePath("/admin/cohorts");
  return { ok: true, message: "Cohort deleted." };
}

const DEFAULT_CRITERIA = [
  { name: "Business viability", description: "Can this business sustain itself?", weight: 3, maxScore: 10 },
  { name: "Innovation and differentiation", description: "What makes it different from what exists?", weight: 2, maxScore: 10 },
  { name: "Market potential", description: "How big is the demand, and is it proven?", weight: 3, maxScore: 10 },
  { name: "Scalability", description: "Can it grow without breaking?", weight: 2, maxScore: 10 },
  { name: "Founder capability", description: "Can this person execute?", weight: 3, maxScore: 10 },
  { name: "Social / economic impact", description: "What does Shama gain?", weight: 2, maxScore: 10 },
  { name: "Funding need", description: "Is the funding request justified and specific?", weight: 1, maxScore: 10 },
];

/* ------------------------------------------------------ scoring criteria */

const criterionSchema = z.object({
  cohortId: z.string().min(1),
  name: z.string().trim().min(2, "Name the criterion"),
  description: z.string().trim().optional(),
  weight: z.coerce.number().int().min(1).max(10),
  maxScore: z.coerce.number().int().min(1).max(100),
});

export async function saveCriterion(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = criterionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const { cohortId, name, description, weight, maxScore } = parsed.data;

  try {
    if (id) {
      await prisma.scoringCriterion.update({
        where: { id },
        data: { name, description: description || null, weight, maxScore },
      });
    } else {
      const count = await prisma.scoringCriterion.count({ where: { cohortId } });
      await prisma.scoringCriterion.create({
        data: { cohortId, name, description: description || null, weight, maxScore, order: count },
      });
    }
  } catch (error) {
    return fail(error);
  }

  revalidatePath(`/admin/cohorts/${cohortId}`);
  return { ok: true, message: id ? "Criterion updated." : "Criterion added." };
}

export async function deleteCriterion(id: string, cohortId: string): Promise<ContentState> {
  await requireAdmin();

  const scores = await prisma.score.count({ where: { criterionId: id } });
  if (scores > 0) {
    return {
      ok: false,
      message: `${scores} score(s) have already been recorded against this criterion, so removing it would change results that are already in. Edit it instead.`,
    };
  }

  try {
    await prisma.scoringCriterion.delete({ where: { id } });
  } catch (error) {
    return fail(error);
  }

  revalidatePath(`/admin/cohorts/${cohortId}`);
  return { ok: true, message: "Criterion removed." };
}

/* --------------------------------------------------- application questions */

const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "select",
  "radio",
  "checkbox",
  "yes_no",
  "number",
  "file",
] as const;

const questionSchema = z.object({
  cohortId: z.string().min(1),
  section: z.string().trim().min(2, "Which section does it belong to?"),
  label: z.string().trim().min(4, "Write the question"),
  helpText: z.string().trim().optional(),
  type: z.enum(QUESTION_TYPES),
  options: z.string().trim().optional(),
});

export async function saveQuestion(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = questionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const { cohortId, section, label, helpText, type, options } = parsed.data;
  const required = formData.get("required") === "on";
  const choices = (options ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (["select", "radio", "checkbox"].includes(type) && choices.length < 2) {
    return {
      ok: false,
      errors: { options: "Give at least two options, one per line." },
      values: formValues(formData),
    };
  }

  try {
    if (id) {
      await prisma.applicationQuestion.update({
        where: { id },
        data: { section, label, helpText: helpText || null, type, options: choices, required },
      });
    } else {
      const count = await prisma.applicationQuestion.count({ where: { cohortId } });
      await prisma.applicationQuestion.create({
        data: {
          cohortId, section, label, helpText: helpText || null,
          type, options: choices, required, order: count,
        },
      });
    }
  } catch (error) {
    return fail(error);
  }

  revalidatePath(`/admin/cohorts/${cohortId}`);
  return { ok: true, message: id ? "Question updated." : "Question added." };
}

export async function toggleQuestion(id: string, cohortId: string, active: boolean) {
  await requireAdmin();
  await prisma.applicationQuestion.update({ where: { id }, data: { active } });
  revalidatePath(`/admin/cohorts/${cohortId}`);
}

export async function deleteQuestion(id: string, cohortId: string): Promise<ContentState> {
  await requireAdmin();

  const answers = await prisma.applicationAnswer.count({ where: { questionId: id } });
  if (answers > 0) {
    return {
      ok: false,
      message: `${answers} applicant(s) have already answered this question. Deactivate it instead so their answers are kept.`,
    };
  }

  try {
    await prisma.applicationQuestion.delete({ where: { id } });
  } catch (error) {
    return fail(error);
  }

  revalidatePath(`/admin/cohorts/${cohortId}`);
  return { ok: true, message: "Question removed." };
}

/* ------------------------------------------------------------------ posts */

const postSchema = z.object({
  title: z.string().trim().min(4, "Give the post a title"),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().min(20, "Write a short summary"),
  body: z.string().trim().min(40, "Write the post"),
  category: z.string().trim().min(2),
  coverUrl: z.string().trim().optional(),
  author: z.string().trim().min(2),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: optionalDate,
  seoTitle: z.string().trim().optional(),
  seoDesc: z.string().trim().optional(),
});

export async function savePost(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const d = parsed.data;
  const values = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    excerpt: d.excerpt,
    body: d.body,
    category: d.category,
    coverUrl: d.coverUrl || null,
    author: d.author,
    status: d.status,
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : new Date(),
    seoTitle: d.seoTitle || null,
    seoDesc: d.seoDesc || null,
  };

  try {
    if (id) await prisma.post.update({ where: { id }, data: values });
    else await prisma.post.create({ data: values });
  } catch (error) {
    return fail(error);
  }

  await audit(admin.id, id ? "post.update" : "post.create", "Post", id || undefined);
  revalidatePath("/admin/content");
  revalidatePath("/news");
  revalidatePath("/");
  return { ok: true, message: id ? "Post updated." : "Post created." };
}

export async function deletePost(id: string): Promise<ContentState> {
  await requireAdmin();
  try {
    await prisma.post.delete({ where: { id } });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin/content");
  revalidatePath("/news");
  return { ok: true, message: "Post deleted." };
}

/* ----------------------------------------------------------------- events */

const eventSchema = z.object({
  title: z.string().trim().min(4, "Give the event a title"),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(20, "Describe the event"),
  startsAt: z.string().trim().min(1, "When does it start?"),
  endsAt: optionalDate,
  location: z.string().trim().min(2, "Where is it?"),
  kind: z.string().trim().min(2),
  stage: z.string().trim().optional(),
  registerUrl: z.string().trim().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
});

export async function saveEvent(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const d = parsed.data;
  if (Number.isNaN(Date.parse(d.startsAt))) {
    return {
      ok: false,
      errors: { startsAt: "Enter a valid date and time" },
      values: formValues(formData),
    };
  }
  if (d.endsAt && new Date(d.endsAt) < new Date(d.startsAt)) {
    return {
      ok: false,
      errors: { endsAt: "The event cannot end before it starts." },
      values: formValues(formData),
    };
  }

  const values = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    description: d.description,
    startsAt: new Date(d.startsAt),
    endsAt: d.endsAt ? new Date(d.endsAt) : null,
    location: d.location,
    kind: d.kind,
    stage: d.stage || null,
    registerUrl: d.registerUrl || null,
    status: d.status,
  };

  try {
    if (id) await prisma.event.update({ where: { id }, data: values });
    else await prisma.event.create({ data: values });
  } catch (error) {
    return fail(error);
  }

  await audit(admin.id, id ? "event.update" : "event.create", "Event", id || undefined);
  revalidatePath("/admin/content");
  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true, message: id ? "Event updated." : "Event created." };
}

export async function deleteEvent(id: string): Promise<ContentState> {
  await requireAdmin();
  try {
    await prisma.event.delete({ where: { id } });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin/content");
  revalidatePath("/events");
  return { ok: true, message: "Event deleted." };
}

/* --------------------------------------------------------------- partners */

const partnerSchema = z.object({
  name: z.string().trim().min(2, "Name the partner"),
  tier: z.string().trim().optional(),
  website: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
  order: z.coerce.number().int().min(0).max(999),
});

export async function savePartner(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = partnerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const d = parsed.data;
  const values = {
    name: d.name,
    tier: d.tier || null,
    website: d.website || null,
    logoUrl: d.logoUrl || null,
    order: d.order,
    featured: formData.get("featured") === "on",
  };

  try {
    if (id) await prisma.partner.update({ where: { id }, data: values });
    else await prisma.partner.create({ data: values });
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/partners");
  revalidatePath("/");
  return { ok: true, message: id ? "Partner updated." : "Partner added." };
}

export async function deletePartner(id: string): Promise<ContentState> {
  await requireAdmin();
  try {
    await prisma.partner.delete({ where: { id } });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin/content");
  revalidatePath("/partners");
  return { ok: true, message: "Partner removed." };
}

/* ------------------------------------------------------------------- team */

const ROLES = [
  "APPLICANT",
  "PARTICIPANT",
  "MENTOR",
  "FACILITATOR",
  "JUDGE",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

const teamSchema = z.object({
  fullName: z.string().trim().min(2, "Enter their full name"),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  role: z.enum(ROLES),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function createTeamMember(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") {
    return { ok: false, message: "Only a super administrator can create accounts." };
  }

  const parsed = teamSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: formValues(formData) };

  const d = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: d.email.toLowerCase() } });
  if (existing) {
    return {
      ok: false,
      errors: { email: "That email already has an account." },
      values: formValues(formData),
    };
  }

  try {
    await prisma.user.create({
      data: {
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        phone: d.phone || null,
        role: d.role,
        passwordHash: await hashPassword(d.password),
      },
    });
  } catch (error) {
    return fail(error);
  }

  await audit(admin.id, "user.create", "User", undefined, { email: d.email, role: d.role });
  revalidatePath("/admin/team");
  return {
    ok: true,
    message: `${d.fullName} can now sign in. Share the password with them directly and ask them to change it.`,
  };
}

export async function changeUserRole(userId: string, role: (typeof ROLES)[number]) {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") return;
  // Removing your own last privilege would lock the platform's owner out.
  if (userId === admin.id) return;

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await audit(admin.id, "user.role", "User", userId, { role });
  revalidatePath("/admin/team");
}

async function audit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  meta?: unknown,
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId, action, entity,
        entityId: entityId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (error) {
    console.error("[audit] failed:", (error as Error).message);
  }
}
