import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { PROGRAMME } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Shama Business Incubator collects, stores, uses and protects applicant and participant data.",
};

const SECTIONS = [
  {
    h: "What we collect",
    p: [
      "When you apply, we collect your name, contact details, date of birth, gender, location, business information, founder background and any documents you upload (identification, business registration, pitch deck, business plan, product images and financial information).",
      "When you contact us or register interest as a mentor, partner or sponsor, we collect the details you provide in that form.",
    ],
  },
  {
    h: "Why we collect it",
    p: [
      "To assess your application against the programme's eligibility and scoring criteria.",
      "To manage your participation: cluster allocation, mentor matching, attendance, assignments, pitch scoring and funding.",
      "To communicate with you by SMS and email about your application status, sessions, deadlines and programme events.",
      "To report aggregate programme impact to partners and sponsors. Aggregate reporting never identifies you individually without your consent.",
    ],
  },
  {
    h: "Consent for public profiles",
    p: [
      "Your business profile is never published on this website unless you explicitly consent to it. Consent for a public profile is collected separately from consent to process your application, and you may withdraw it at any time by contacting the programme team.",
    ],
  },
  {
    h: "Who can see your data",
    p: [
      "Access is controlled by role. You can see your own data. Mentors can see the mentees assigned to them. Facilitators can see participants in the sessions they run. Judges can see the pitch materials and scoring forms for the businesses assigned to them, and cannot see other judges' scores until scoring closes.",
      "Personal, assessment and financial information is restricted to authorised programme administrators. Access is logged.",
    ],
  },
  {
    h: "How we protect it",
    p: [
      "Passwords are stored using one-way encryption and are never visible to programme staff. Documents are stored in access-controlled cloud storage. Sessions expire, administrative actions are recorded in an audit log, and the platform is backed up.",
    ],
  },
  {
    h: "SMS communications",
    p: [
      "Programme SMS is delivered through GiantSMS, a Ghanaian messaging provider. Only your mobile number and the message content are shared with them for the purpose of delivery. You can ask us to stop sending SMS at any time, though this may mean you miss time-sensitive programme information.",
    ],
  },
  {
    h: "Retention and your rights",
    p: [
      "Application and participation records are retained for the duration of the programme and its impact-tracking period so that longitudinal outcomes can be reported. You may request a copy of your data, ask for corrections, or ask for your account to be deactivated.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        crumbs={[{ label: "Privacy", href: "/privacy" }]}
        title="Privacy policy"
        lead="Plain language about what the programme collects, why, and who can see it."
      image="/brand/photo-mentorship.webp"
        imagePosition="center"
      />

      <Section>
        <div className="mx-auto max-w-3xl space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.h}>
              <h2 className="font-display text-2xl text-ink-900">{section.h}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-ink-500">
                {section.p.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl bg-lime-50 p-8">
            <h2 className="font-display text-xl text-ink-900">Questions about your data</h2>
            <p className="mt-3 leading-relaxed text-ink-500">
              Contact the programme team at{" "}
              <a href={`mailto:${PROGRAMME.email}`} className="font-medium text-lime-700 underline">
                {PROGRAMME.email}
              </a>{" "}
              or on {PROGRAMME.phone}.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
