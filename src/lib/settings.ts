import "server-only";
import { prisma, safeQuery } from "@/lib/db";

/**
 * Admin-editable programme figures (PRD §6.2, §27, §49). Defaults come from
 * the programme deck; anything overridden in the `settings` table wins.
 */
export const SETTING_DEFAULTS = {
  applications_open: "true",
  applications_close_date: "2026-09-30",
  hero_headline: "Ignite Ideas. Fund Potential. Scale Impact.",
  stat_entrepreneurs: "100",
  stat_clusters: "4",
  stat_investment_ready: "20",
  stat_funded: "20",
  stat_funding: "480000",
  stat_bootcamp_weeks: "8",
  impact_trained: "0",
  impact_supported: "0",
  impact_funded: "0",
  impact_funding_awarded: "0",
  impact_jobs: "0",
  impact_still_operating: "0",
  impact_generating_revenue: "0",
  impact_partnerships: "0",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await safeQuery(() => prisma.setting.findMany(), []);
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...SETTING_DEFAULTS, ...overrides } as Settings;
}

export async function setSetting(key: SettingKey, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export function num(settings: Settings, key: SettingKey): number {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : 0;
}

export async function applicationsOpen(): Promise<boolean> {
  const settings = await getSettings();
  return settings.applications_open === "true";
}
