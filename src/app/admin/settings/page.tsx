import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Programme settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Content management
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Programme settings</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Everything on this page is published to the public website without a code change.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
