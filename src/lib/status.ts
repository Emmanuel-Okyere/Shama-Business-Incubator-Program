import type { ApplicationStatus } from "@prisma/client";

/** Applicant-facing status flow (PRD §10, §36). */
export const STATUS_FLOW: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
];

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; blurb: string; tone: "neutral" | "progress" | "good" | "bad" }
> = {
  DRAFT: {
    label: "Draft",
    blurb: "Your application has not been submitted yet.",
    tone: "neutral",
  },
  SUBMITTED: {
    label: "Submitted",
    blurb: "Received. It is in the queue for screening.",
    tone: "progress",
  },
  UNDER_REVIEW: {
    label: "Under review",
    blurb: "Reviewers are scoring your application against the programme criteria.",
    tone: "progress",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    blurb: "You made the shortlist. The team will contact you about the next stage.",
    tone: "good",
  },
  INTERVIEW: {
    label: "Interview",
    blurb: "You have been invited to an assessment interview.",
    tone: "good",
  },
  SELECTED: {
    label: "Selected",
    blurb: "Congratulations — you are in the cohort. Onboarding details follow.",
    tone: "good",
  },
  NOT_SELECTED: {
    label: "Not selected",
    blurb:
      "You were not selected for this cohort. We will alert you when the next one opens.",
    tone: "bad",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    blurb: "This application was withdrawn.",
    tone: "neutral",
  },
};

export const STATUS_CLASSES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-ink-900/8 text-ink-500",
  SUBMITTED: "bg-sky-100 text-sky-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  SHORTLISTED: "bg-lime-200 text-lime-900",
  INTERVIEW: "bg-indigo-100 text-indigo-800",
  SELECTED: "bg-lime-600 text-white",
  NOT_SELECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-ink-900/8 text-ink-500",
};
