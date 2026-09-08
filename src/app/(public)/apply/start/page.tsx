import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Wizard, type WizardApplication } from "@/components/apply/Wizard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { getSession } from "@/lib/auth";
import { describeDatabase, type DatabaseState } from "@/lib/db";
import { explainDatabase } from "@/lib/db-messages";
import { getOrCreateApplication } from "@/lib/actions/application";
import { getSettings } from "@/lib/settings";
import { PROGRAMME } from "@/lib/programme";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your application",
  robots: { index: false, follow: false },
};

export default async function ApplyStartPage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=%2Fapply%2Fstart");

  const settings = await getSettings();
  if (settings.applications_open !== "true") redirect("/interest");

  const database = await describeDatabase();
  if (database.status !== "ready") return <NotReady state={database} />;

  let application;
  try {
    application = await getOrCreateApplication(user.id);
  } catch (error) {
    // Log the real failure: swallowing it leaves nobody — including the
    // programme team reading the deployment logs — able to see what broke.
    console.error("[apply] could not open an application:", error);
    return (
      <NotReady state={{ status: "unreachable", error: (error as Error).message }} />
    );
  }

  if (application.status !== "DRAFT") redirect("/portal");

  const { cluster } = await searchParams;

  const wizardData: WizardApplication = {
    id: application.id,
    reference: application.reference,
    currentStep: application.currentStep,
    cluster: application.cluster,
    dateOfBirth: application.dateOfBirth?.toISOString() ?? null,
    gender: application.gender,
    community: application.community,
    businessName: application.businessName,
    businessLocation: application.businessLocation,
    registrationStatus: application.registrationStatus,
    businessStage: application.businessStage,
    businessDescription: application.businessDescription,
    problemSolved: application.problemSolved,
    productService: application.productService,
    targetMarket: application.targetMarket,
    currentCustomers: application.currentCustomers,
    monthlyRevenue: application.monthlyRevenue,
    employees: application.employees,
    yearsOperating: application.yearsOperating,
    challenges: application.challenges,
    growthPlans: application.growthPlans,
    fundingRequired: application.fundingRequired,
    fundingUse: application.fundingUse,
    founderBackground: application.founderBackground,
    experience: application.experience,
    education: application.education,
    priorVenture: application.priorVenture,
    motivation: application.motivation,
    goals: application.goals,
    referralSource: application.referralSource,
    documents: application.documents.map((d) => ({
      id: d.id,
      kind: d.kind,
      fileName: d.fileName,
      url: d.url,
      size: d.size,
    })),
  };

  return (
    <div className="bg-lime-50/40 py-12 sm:py-16">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-lime-700 uppercase">
              {PROGRAMME.cohort} application
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">
              {application.reference}
            </h1>
            <p className="mt-2 text-ink-500">
              Progress saves automatically. Closes {formatDate(settings.applications_close_date)}.
            </p>
          </div>
          <Link
            href="/portal"
            className="text-sm font-semibold text-lime-700 hover:underline"
          >
            Save and exit
          </Link>
        </div>

        <div className="rounded-[1.75rem] border border-ink-900/8 bg-white p-6 sm:p-10">
          <Wizard
            application={wizardData}
            fullName={user.fullName}
            defaultCluster={cluster}
          />
        </div>
      </Container>
    </div>
  );
}

function NotReady({ state }: { state: DatabaseState }) {
  const { title, body, fix } = explainDatabase(state);

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-ink-900/8 bg-white p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-ink-900">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-ink-900">{title}</h1>
        <p className="mt-3 leading-relaxed text-ink-500">{body}</p>

        {fix && (
          <p className="mt-6 rounded-2xl bg-lime-50 px-5 py-4 text-left text-[0.85rem] leading-relaxed text-lime-900">
            {fix}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/contact" variant="outline">
            Contact the programme team
          </Button>
          <Button href="/">
            Back to the website
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Container>
  );
}
