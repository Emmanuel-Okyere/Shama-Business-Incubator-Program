"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, Input } from "@/components/ui/Field";

function useNext() {
  const params = useSearchParams();
  const next = params.get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={shown ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-500 transition-colors hover:text-ink-900"
      >
        {shown ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useNext();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reason = params.get("reason");
  const notice =
    reason === "reused"
      ? "For your security, all sessions were signed out because a used sign-in token was replayed. Please sign in again."
      : reason === "expired"
        ? "Your session expired. Please sign in again."
        : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not sign you in. Please try again.");
      setPending(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-3xl text-ink-900">Welcome back</h1>
      <p className="mt-2.5 text-ink-500">
        Sign in to track your application or manage the programme.
      </p>

      <form onSubmit={onSubmit} className="mt-9 space-y-5">
        {notice && <FormMessage tone="error">{notice}</FormMessage>}
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <Field label="Email address" required>
          <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </Field>

        <Field label="Password" required>
          <PasswordInput name="password" autoComplete="current-password" placeholder="••••••••" required />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-semibold text-lime-700 hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const next = useNext();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not create your account. Please try again.");
      setPending(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-3xl text-ink-900">Create your account</h1>
      <p className="mt-2.5 text-ink-500">
        One account gets you through the application and, if selected, the whole programme.
      </p>

      <form onSubmit={onSubmit} className="mt-9 space-y-5">
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <Field label="Full name" required>
          <Input name="fullName" autoComplete="name" placeholder="Ama Mensah" required />
        </Field>

        <Field label="Email address" required>
          <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </Field>

        <Field label="Mobile number" required hint="Programme updates are sent here by SMS">
          <Input name="phone" type="tel" autoComplete="tel" placeholder="024 123 4567" required />
        </Field>

        <Field label="Password" required hint="At least 8 characters">
          <PasswordInput
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={8}
            required
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-[0.78rem] leading-relaxed text-ink-500">
          By creating an account you agree to the programme&apos;s{" "}
          <Link href="/privacy" className="font-medium text-lime-700 hover:underline">
            privacy policy
          </Link>
          . Your business profile is never published without separate consent.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-lime-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
