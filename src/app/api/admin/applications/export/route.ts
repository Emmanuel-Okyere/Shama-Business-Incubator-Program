import { NextResponse } from "next/server";
import type { ApplicationStatus, ClusterKey, Prisma } from "@prisma/client";
import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const COLUMNS = [
  "Reference", "Status", "Cluster", "Full name", "Email", "Phone", "Date of birth",
  "Gender", "Community", "Business name", "Business location", "Registration status",
  "Stage", "Monthly revenue", "Employees", "Years operating", "Funding requested (GHS)",
  "Funding use", "Description", "Problem solved", "Target market", "Challenges",
  "Growth plans", "Motivation", "Documents", "Average score", "Submitted at",
];

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export async function GET(request: Request) {
  const user = await getSession();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const where: Prisma.ApplicationWhereInput = {};
  const status = url.searchParams.get("status");
  const cluster = url.searchParams.get("cluster");
  if (status) where.status = status as ApplicationStatus;
  if (cluster) where.cluster = cluster as ClusterKey;

  const applications = await prisma.application.findMany({
    where,
    include: { user: true, reviews: true, _count: { select: { documents: true } } },
    orderBy: { submittedAt: "desc" },
  });

  const rows = applications.map((a) => {
    const scored = a.reviews.filter((r) => r.submittedAt);
    const average =
      scored.length > 0 ? (scored.reduce((s, r) => s + r.total, 0) / scored.length).toFixed(1) : "";
    return [
      a.reference, a.status, a.cluster ?? "", a.user.fullName, a.user.email, a.user.phone ?? "",
      a.dateOfBirth?.toISOString().slice(0, 10) ?? "", a.gender ?? "", a.community ?? "",
      a.businessName ?? "", a.businessLocation ?? "", a.registrationStatus ?? "",
      a.businessStage ?? "", a.monthlyRevenue ?? "", a.employees ?? "", a.yearsOperating ?? "",
      a.fundingRequired ?? "", a.fundingUse ?? "", a.businessDescription ?? "",
      a.problemSolved ?? "", a.targetMarket ?? "", a.challenges ?? "", a.growthPlans ?? "",
      a.motivation ?? "", a._count.documents, average,
      a.submittedAt?.toISOString() ?? "",
    ];
  });

  // BOM so Excel opens the file as UTF-8 and Ghanaian names render correctly.
  const csv =
    "﻿" +
    [COLUMNS, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shama-applications-${stamp}.csv"`,
    },
  });
}
