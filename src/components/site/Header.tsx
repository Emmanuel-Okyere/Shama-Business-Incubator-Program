"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { UserMenu, type HeaderUser } from "@/components/site/UserMenu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { NAV } from "@/lib/programme";
import { cn, initials } from "@/lib/utils";

const PRIMARY = NAV.slice(0, 6);
const MORE = NAV.slice(6);

export function Header({
  applicationsOpen,
  user,
}: {
  applicationsOpen: boolean;
  user: HeaderUser | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Both menus record the route they were opened on rather than a plain
  // boolean, so navigating away closes them as a consequence of the render
  // instead of needing an effect to reach back in and reset them.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const [moreOpenedOn, setMoreOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const moreOpen = moreOpenedOn === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-ink-900/8" : "border-b border-transparent",
      )}
    >
      {/*
        The blur lives on its own layer rather than on <header>. An element
        with backdrop-filter becomes the containing block for any
        position: fixed descendant, which trapped the mobile menu inside the
        4.75rem-tall header the moment the page was scrolled — the menu opened,
        locked scrolling, and rendered nowhere.
      */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 transition-colors duration-300",
          scrolled ? "bg-white/85 backdrop-blur-xl" : "bg-white",
        )}
      />

      <Container className="flex h-[4.75rem] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY.map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname.startsWith(item.href)}>
              {item.label}
            </NavLink>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpenedOn(pathname)}
            onMouseLeave={() => setMoreOpenedOn(null)}
          >
            <button
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-900"
              aria-expanded={moreOpen}
            >
              More
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-1/2 w-56 -translate-x-1/2 pt-2">
                <div className="animate-rise overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-card">
                  {MORE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-lime-50 hover:text-lime-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Button href="/login" variant="ghost" size="sm">
              Sign in
            </Button>
          )}
          <Button href={applicationsOpen ? "/apply" : "/interest"} size="sm">
            {applicationsOpen ? "Apply Now" : "Join the interest list"}
          </Button>
        </div>

        <button
          onClick={() => setOpenedOn(open ? null : pathname)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-ink-900/10 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="fixed inset-x-0 top-[4.75rem] bottom-0 z-40 overflow-y-auto bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-6">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 22}ms` }}
                className="animate-rise border-b border-ink-900/6 py-3.5 font-display text-lg font-medium text-ink-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Button href={applicationsOpen ? "/apply" : "/interest"} size="lg">
                {applicationsOpen ? "Apply Now" : "Join the interest list"}
              </Button>

              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-lime-50 px-5 py-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-500 font-display text-[0.8rem] font-bold text-ink-950">
                      {initials(user.fullName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.9rem] font-semibold text-ink-900">
                        {user.fullName}
                      </span>
                      <span className="block truncate text-[0.78rem] text-ink-500">
                        {user.email}
                      </span>
                    </span>
                  </div>
                  <Button href="/portal" variant="outline" size="lg">
                    Your dashboard
                  </Button>
                  {user.isAdmin && (
                    <Button href="/admin" variant="outline" size="lg">
                      Admin dashboard
                    </Button>
                  )}
                  <form action="/api/auth/logout?redirect=1" method="post">
                    <Button type="submit" variant="ghost" size="lg" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <Button href="/login" variant="outline" size="lg">
                  Sign in to your dashboard
                </Button>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "text-ink-900" : "text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-900",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-lime-500" />
      )}
    </Link>
  );
}
