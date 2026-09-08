import Link from "next/link";
import { LogOut } from "lucide-react";
import { SeedMark } from "@/components/site/Logo";
import { Container } from "@/components/ui/Section";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { initials } from "@/lib/utils";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-lime-50/40">
      <header className="border-b border-ink-900/8 bg-white">
        <Container className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-500">
              <SeedMark className="h-5.5 w-5.5 text-ink-950" />
            </span>
            <span className="font-display text-[0.9rem] leading-tight font-bold">
              Shama Business
              <br />
              <span className="text-lime-600">Incubator</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin(user) && (
              <Link
                href="/admin"
                className="rounded-full bg-ink-950 px-4 py-2 text-[0.82rem] font-medium text-white transition-colors hover:bg-ink-700"
              >
                Admin
              </Link>
            )}
            {user && (
              <span className="hidden items-center gap-2.5 sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lime-500 font-display text-[0.75rem] font-bold text-ink-950">
                  {initials(user.fullName)}
                </span>
                <span className="text-[0.85rem] font-medium text-ink-900">{user.fullName}</span>
              </span>
            )}
            <form action="/api/auth/logout?redirect=1" method="post">
              <button
                type="submit"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-10 sm:py-14">{children}</main>
    </div>
  );
}
