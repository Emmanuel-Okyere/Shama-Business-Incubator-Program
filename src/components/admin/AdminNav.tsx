"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  FileText,
  Handshake,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", Icon: Users },
  { href: "/admin/cohorts", label: "Cohorts", Icon: CalendarRange },
  { href: "/admin/content", label: "Content", Icon: FileText },
  { href: "/admin/communications", label: "Communications", Icon: MessageSquare },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
  { href: "/admin/partners", label: "Partner pipeline", Icon: Handshake },
  { href: "/admin/team", label: "Team", Icon: UserCog },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        horizontal
          ? "flex gap-1 overflow-x-auto border-b border-ink-900/8 bg-white px-4 py-2"
          : "flex flex-col gap-1 px-4",
      )}
    >
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] font-medium transition-colors",
              active
                ? "bg-lime-500 text-ink-950"
                : "text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={horizontal ? "whitespace-nowrap" : ""}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
