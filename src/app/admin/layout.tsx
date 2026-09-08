import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { SeedMark } from "@/components/site/Logo";
import { getSession, isAdmin } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=%2Fadmin");
  if (!isAdmin(user)) redirect("/portal?error=forbidden");

  return (
    <div className="flex min-h-screen bg-lime-50/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-900/8 bg-white lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 py-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-500">
            <SeedMark className="h-5.5 w-5.5 text-ink-950" />
          </span>
          <span className="font-display text-[0.85rem] leading-tight font-bold">
            Shama Incubator
            <br />
            <span className="text-lime-600">Admin</span>
          </span>
        </Link>

        <AdminNav />

        <div className="mt-auto border-t border-ink-900/8 p-4">
          <div className="flex items-center gap-3 px-2 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-500 font-display text-[0.72rem] font-bold text-ink-950">
              {initials(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] font-semibold text-ink-900">{user.fullName}</p>
              <p className="truncate text-[0.72rem] text-ink-500">
                {user.role.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>
          <form action="/api/auth/logout?redirect=1" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] font-medium text-ink-500 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-ink-900/8 bg-white px-5 py-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-500">
              <SeedMark className="h-5 w-5 text-ink-950" />
            </span>
            <span className="font-display text-sm font-bold">Admin</span>
          </Link>
          <form action="/api/auth/logout?redirect=1" method="post">
            <button type="submit" aria-label="Sign out" className="text-ink-500">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>

        <div className="lg:hidden">
          <AdminNav horizontal />
        </div>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
