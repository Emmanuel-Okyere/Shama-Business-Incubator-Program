import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, issueTokens, requestMeta, setAuthCookies } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const tokens = await issueTokens(user, await requestMeta());
  await setAuthCookies(tokens);

  return NextResponse.json({ user, ...tokens });
}
