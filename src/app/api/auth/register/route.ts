import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, issueTokens, requestMeta, setAuthCookies } from "@/lib/auth";
import { dbConfigured, prisma } from "@/lib/db";
import { isValidGhanaPhone, normaliseGhanaPhone } from "@/lib/sms";

export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().trim().min(2),
  email: z.email(),
  phone: z.string().refine(isValidGhanaPhone, "Enter a valid Ghanaian mobile number"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function POST(request: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const { fullName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists. Sign in instead." },
      { status: 409 },
    );
  }

  const created = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      phone: normaliseGhanaPhone(phone),
      passwordHash: await hashPassword(password),
      role: "APPLICANT",
    },
  });

  const user = {
    id: created.id,
    email: created.email,
    fullName: created.fullName,
    role: created.role,
  };
  const tokens = await issueTokens(user, await requestMeta());
  await setAuthCookies(tokens);

  return NextResponse.json({ user, ...tokens }, { status: 201 });
}
