import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterestForm } from "@/components/site/forms/InterestForm";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { applicationsOpen } from "@/lib/settings";
import { PROGRAMME } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Interest List",
  description:
    "Applications are currently closed. Join the interest list to be notified by SMS when the next Shama Business Incubator cohort opens.",
  robots: { index: false, follow: true },
};

// Figures here are admin-editable; revalidatePath refreshes them on save, and
// this is the backstop if the data changes outside the admin UI.
export const revalidate = 300;

export default async function InterestPage() {
  if (await applicationsOpen()) redirect("/apply");

  return (
    <>
      <PageHero
        eyebrow="Interest List"
        crumbs={[{ label: "Interest list", href: "/interest" }]}
        title="Be first to know when applications open"
        lead={`Applications for ${PROGRAMME.cohort} are closed. Leave your details and we will text you the moment the next cohort opens.`}
      image="/brand/photo-shama-steps.webp"
      />

      <Section>
        <div className="mx-auto max-w-2xl rounded-3xl border border-ink-900/8 bg-white p-8 sm:p-10">
          <InterestForm />
        </div>
      </Section>
    </>
  );
}
