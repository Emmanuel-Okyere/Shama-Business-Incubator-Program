import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/forms/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { ENQUIRY_CATEGORIES, PROGRAMME } from "@/lib/programme";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Shama Business Incubator team about applications, partnerships, sponsorship, mentorship or media.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        crumbs={[{ label: "Contact", href: "/contact" }]}
        title="Talk to the programme team"
        lead="Enquiries are routed to the right person on the team by category, and acknowledged by SMS if you leave a mobile number."
      image="/brand/photo-mentorship.webp"
        imagePosition="left"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <h2 className="font-display text-2xl text-ink-900">Send an enquiry</h2>
            <p className="mt-2 text-ink-500">We respond within 2 working days.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-ink-950 p-8 text-white">
              <h3 className="font-display text-lg">Programme office</h3>
              <div className="mt-6 space-y-4 text-[0.92rem]">
                <a
                  href={`mailto:${PROGRAMME.email}`}
                  className="flex items-start gap-3.5 text-white/65 transition-colors hover:text-lime-300"
                >
                  <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-lime-400" />
                  {PROGRAMME.email}
                </a>
                <a
                  href={`tel:${PROGRAMME.phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-3.5 text-white/65 transition-colors hover:text-lime-300"
                >
                  <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-lime-400" />
                  {PROGRAMME.phone}
                </a>
                <p className="flex items-start gap-3.5 leading-relaxed text-white/65">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-lime-400" />
                  {PROGRAMME.address}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-ink-900/8 bg-white p-8">
              <MessageSquare className="h-6 w-6 text-lime-600" />
              <h3 className="mt-5 font-display text-lg text-ink-900">Where your message goes</h3>
              <ul className="mt-5 space-y-2.5">
                {ENQUIRY_CATEGORIES.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-[0.9rem] text-ink-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[0.85rem] leading-relaxed text-ink-500">
                Each category is routed to the administrator responsible for it, so you are not
                waiting on a general inbox.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
