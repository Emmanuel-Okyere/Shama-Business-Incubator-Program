import type { Metadata } from "next";
import { NewTeamMember } from "@/components/admin/ContentForms";
import { getSession } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/db";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super administrator",
  ADMIN: "Programme administrator",
  FACILITATOR: "Facilitator",
  JUDGE: "Judge",
  MENTOR: "Mentor",
  PARTICIPANT: "Participant",
  APPLICANT: "Applicant",
};

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "FACILITATOR", "JUDGE", "MENTOR"] as const;

export default async function TeamPage() {
  const me = await getSession();

  const staff = await safeQuery(
    () =>
      prisma.user.findMany({
        where: { role: { in: [...STAFF_ROLES] } },
        orderBy: [{ role: "asc" }, { fullName: "asc" }],
      }),
    [],
  );

  const isSuper = me?.role === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
          Access control
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">Team</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Accounts with access beyond the applicant portal. The seed creates the first super
          administrator; everyone after that is created here.
        </p>
      </header>

      {isSuper ? (
        <div className="mb-6">
          <NewTeamMember />
        </div>
      ) : (
        <p className="mb-6 rounded-2xl bg-cream-50 px-6 py-4 text-[0.88rem] leading-relaxed text-ink-500">
          Only a super administrator can create accounts or change roles.
        </p>
      )}

      <section className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
        <div className="border-b border-ink-900/8 px-7 py-5">
          <h2 className="font-display text-lg text-ink-900">Accounts ({staff.length})</h2>
        </div>
        <ul className="divide-y divide-ink-900/6">
          {staff.map((person) => (
            <li key={person.id} className="flex items-center gap-4 px-7 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-500 font-display text-[0.75rem] font-bold text-ink-950">
                {initials(person.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">
                  {person.fullName}
                  {person.id === me?.id && (
                    <span className="ml-2 text-[0.72rem] font-normal text-ink-500">(you)</span>
                  )}
                </p>
                <p className="truncate text-[0.78rem] text-ink-500">{person.email}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[0.82rem] font-medium text-ink-900">
                  {ROLE_LABELS[person.role] ?? person.role}
                </p>
                <p className="text-[0.72rem] text-ink-500">
                  {person.lastLoginAt ? `last in ${formatDate(person.lastLoginAt)}` : "never signed in"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
