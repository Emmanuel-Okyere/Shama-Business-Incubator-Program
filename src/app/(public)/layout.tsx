import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { applicationsOpen } from "@/lib/settings";
import { getSession, isAdmin } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const open = await applicationsOpen();

  // Reading the session here opts the public pages into dynamic rendering.
  // Keeping them in a static shell would mean enabling Cache Components and
  // streaming this behind Suspense, which is an app-wide migration; showing a
  // signed-in visitor a "Sign in" button is the worse trade.
  const session = await getSession();
  const user = session
    ? { fullName: session.fullName, email: session.email, isAdmin: isAdmin(session) }
    : null;
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Header applicationsOpen={open} user={user} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer signedIn={Boolean(user)} />
    </div>
  );
}
