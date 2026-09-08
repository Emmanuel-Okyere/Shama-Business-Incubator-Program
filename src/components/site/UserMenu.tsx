"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export interface HeaderUser {
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 transition-colors hover:bg-ink-900/[0.04]"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-500 font-display text-[0.7rem] font-bold text-ink-950">
          {initials(user.fullName)}
        </span>
        <span className="max-w-[7.5rem] truncate text-sm font-medium text-ink-900">
          {user.fullName.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-ink-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-card"
        >
          <div className="border-b border-ink-900/6 px-3.5 py-3">
            <p className="truncate text-[0.85rem] font-semibold text-ink-900">{user.fullName}</p>
            <p className="truncate text-[0.75rem] text-ink-500">{user.email}</p>
          </div>

          <Link
            href="/portal"
            role="menuitem"
            className="mt-1.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-lime-50 hover:text-lime-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            Your dashboard
          </Link>

          {user.isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-lime-50 hover:text-lime-700"
            >
              <Shield className="h-4 w-4" />
              Admin dashboard
            </Link>
          )}

          <form action="/api/auth/logout?redirect=1" method="post">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-ink-500 transition-colors hover:bg-red-50 hover:text-brandred"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
