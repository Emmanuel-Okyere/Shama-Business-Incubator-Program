/**
 * Seeds the active cohort, application questions, scoring criteria, admin and
 * demo accounts, plus enough public content that the site does not look empty
 * on first deploy.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Describes the connection without leaking the password, so the run says out
 * loud which database it is about to write to. Seeding a local database while
 * believing you have seeded a hosted one produces a cheerful success message
 * and an empty Cohort table, and there is otherwise nothing on screen to tell
 * you apart.
 */
function describeTarget(url: string): string {
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.replace(/^\//, "") || "(none)";
    const port = parsed.port ? `:${parsed.port}` : "";
    return `${parsed.username ? `${parsed.username}@` : ""}${parsed.hostname}${port}/${database}`;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@shamaincubator.org";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";

const CRITERIA = [
  { name: "Business viability", description: "Can this business sustain itself?", weight: 3, maxScore: 10 },
  { name: "Innovation and differentiation", description: "What makes it different from what exists?", weight: 2, maxScore: 10 },
  { name: "Market potential", description: "How big is the demand, and is it proven?", weight: 3, maxScore: 10 },
  { name: "Scalability", description: "Can it grow without breaking?", weight: 2, maxScore: 10 },
  { name: "Founder capability", description: "Can this person execute?", weight: 3, maxScore: 10 },
  { name: "Social / economic impact", description: "What does Shama gain?", weight: 2, maxScore: 10 },
  { name: "Funding need", description: "Is the funding request justified and specific?", weight: 1, maxScore: 10 },
];

const QUESTIONS = [
  { section: "Business", label: "Do you currently keep written financial records?", type: "yes_no", required: true, order: 1 },
  { section: "Business", label: "Which of these do you most need help with?", type: "select", options: ["Access to capital", "Finding customers", "Production capacity", "Pricing and costing", "Formalisation", "Staffing"], required: true, order: 2 },
  { section: "Founder", label: "How many hours a week can you commit to the programme?", type: "number", required: true, order: 3 },
  { section: "Founder", label: "Do you have a co-founder or business partner? If so, who?", type: "long_text", required: false, order: 4 },
];

const POSTS = [
  {
    slug: "applications-open-for-cohort-1",
    title: "Applications open for Cohort 1",
    excerpt:
      "100 seats across four clusters, an 8-week bootcamp and GHS 480,000 in grant funding. Applications are open to entrepreneurs aged 18–35 in the Shama Constituency.",
    category: "Announcement",
    body: `The Shama Business Incubator is now accepting applications for its first cohort.

The programme will select 100 entrepreneurs across four clusters — Creative Craft, Agric & Agri-businesses, Fisheries & Aquaculture, and Tech & Innovation — with 25 seats in each. Selected participants complete an intensive eight-week bootcamp covering business model development, financial literacy, branding and marketing, market validation, and operations and scale.

Every participant is matched one-to-one with an experienced mentor for the duration of the programme, and keeps that relationship afterwards through quarterly Growth Labs.

At the end of week eight, participants pitch within their clusters. The top five from each cluster progress to the Ultimate Pitch, where twenty finalists present before a panel of judges, investors and stakeholders. Grant funding of GHS 480,000 is allocated on the strength of those pitches, in tiers from GHS 10,000 to GHS 50,000.

Applying is free. You will need identification and, if you have them, business registration documents, a pitch deck or business plan, and photographs of your products. Registration is not required to apply.`,
  },
  {
    slug: "why-shama-why-now",
    title: "Why Shama, and why now",
    excerpt:
      "High youth unemployment, strong entrepreneurial interest and low business survival rates. The incubator is designed to close three gaps at once.",
    category: "Programme update",
    body: `Shama has no shortage of people willing to start something. What it has lacked is the infrastructure that turns a start into a business that survives its third year.

Three gaps come up repeatedly: limited access to funding, weak business structures, and a lack of mentorship and networks. Each one alone is survivable. Together, they are why so many promising ventures in the constituency stall within eighteen months.

The incubator is built to close all three inside a single programme. Training addresses structure. Mentorship addresses networks and judgement. The pitch process addresses capital — and does it competitively, so the money follows demonstrated capability rather than proximity to whoever is handing it out.

The design deliberately does not stop at graduation. Quarterly Growth Labs track business performance, address emerging bottlenecks and provide advanced training in scaling, operations and finance. Participants retain access to their mentors. Each year, an Annual Cohort Exit showcases businesses to investors, partners and the public.`,
  },
  {
    slug: "what-the-four-clusters-mean",
    title: "What the four clusters mean for your application",
    excerpt:
      "Choosing the right cluster shapes your training, your facilitators and who you pitch against. Here is how to pick.",
    category: "Guidance",
    body: `The programme is organised into four clusters, each with thirty seats: Creative Craft, Agric & Agri-businesses, Fisheries & Aquaculture, and Tech & Innovation.

Your cluster determines more than a label. It shapes which training modules you receive, which facilitators teach you, which mentors you are matched with, and — at the end of week eight — who you pitch against for one of the five finalist places in your cluster.

If your business spans two clusters, choose the one your customers pay you for today. A tailor who sells online is still Creative Craft. A cold-storage operator serving fishermen is Fisheries & Aquaculture, not logistics.

The programme team can move you during onboarding if the fit is clearly better elsewhere, so choose honestly rather than strategically. There is no cluster that is easier to win from: the funding tiers are allocated across all twenty finalists together, on the strength of the pitch.`,
  },
];

const PARTNERS = [
  { name: "Ministry of Fisheries & Aquaculture Development", tier: "Institutional", order: 1 },
  { name: "Shama District Assembly", tier: "Institutional", order: 2 },
  { name: "Sons & Daughters of Shama", tier: "Community", order: 3 },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\nDATABASE_URL is not set, so there is no database to seed.\n" +
        "Set it in .env, or pass it for one run:\n" +
        '  DATABASE_URL="postgresql://…" npm run db:seed\n',
    );
    process.exit(1);
  }

  const target = describeTarget(url);
  console.log(`\nSeeding Shama Business Incubator`);
  console.log(`  target: ${target}\n`);

  if (/localhost|127\.0\.0\.1/.test(url)) {
    console.log(
      "  Note: this is a local database. To seed a hosted one, pass its URL\n" +
        '  explicitly: DATABASE_URL="postgresql://…" npm run db:seed\n',
    );
  }

  /* --------------------------------------------------------- cohort */
  const cohort = await prisma.cohort.upsert({
    where: { slug: "cohort-1" },
    update: { isActive: true },
    create: {
      name: "Cohort 1",
      slug: "cohort-1",
      year: 2026,
      seats: 100,
      applicationsOpen: true,
      opensAt: new Date("2026-08-01"),
      closesAt: new Date("2026-09-30"),
      bootcampStartsAt: new Date("2026-10-05"),
      ultimatePitchAt: new Date("2026-12-10"),
      isActive: true,
    },
  });
  console.log(`  ✓ cohort: ${cohort.name} (${cohort.slug})`);

  /* ----------------------------------------------- scoring criteria */
  const existingCriteria = await prisma.scoringCriterion.count({
    where: { cohortId: cohort.id },
  });
  if (existingCriteria === 0) {
    await prisma.scoringCriterion.createMany({
      data: CRITERIA.map((c, i) => ({ ...c, cohortId: cohort.id, order: i })),
    });
    console.log(`  ✓ ${CRITERIA.length} scoring criteria`);
  }

  /* -------------------------------------------------- extra questions */
  const existingQuestions = await prisma.applicationQuestion.count({
    where: { cohortId: cohort.id },
  });
  if (existingQuestions === 0) {
    for (const q of QUESTIONS) {
      await prisma.applicationQuestion.create({
        data: { ...q, options: q.options ?? [], cohortId: cohort.id },
      });
    }
    console.log(`  ✓ ${QUESTIONS.length} application questions`);
  }

  /* ------------------------------------------------------- accounts */
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      fullName: "Programme Administrator",
      phone: "0240000000",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  ✓ admin account: ${admin.email}`);

  /* -------------------------------------------------------- content */
  for (const post of POSTS) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, status: "PUBLISHED", author: "Programme Team" },
    });
  }
  console.log(`  ✓ ${POSTS.length} news posts`);

  const events = [
    {
      slug: "information-session-shama-junction",
      title: "Information Session — Shama Junction",
      description:
        "Find out how the programme works, what the application asks for, and whether your business is eligible. Bring your questions.",
      startsAt: new Date("2026-09-05T10:00:00Z"),
      location: "Shama District Assembly Hall",
      kind: "Information Session",
      stage: "Application",
    },
    {
      slug: "information-session-aboadze",
      title: "Information Session — Aboadze",
      description:
        "A session focused on fisheries, aquaculture and coastal businesses, with the programme team on hand.",
      startsAt: new Date("2026-09-12T10:00:00Z"),
      location: "Aboadze Community Centre",
      kind: "Information Session",
      stage: "Application",
    },
    {
      slug: "ultimate-pitch-2026",
      title: "The Ultimate Pitch",
      description:
        "Twenty finalists pitch before judges, investors and stakeholders. Grant funding of GHS 480,000 is allocated on the day.",
      startsAt: new Date("2026-12-10T09:00:00Z"),
      location: "Shama, Western Region",
      kind: "Pitch Competition",
      stage: "Ultimate Pitch",
    },
  ];
  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: { ...event, status: "PUBLISHED" },
    });
  }
  console.log(`  ✓ ${events.length} events`);

  const existingPartners = await prisma.partner.count();
  if (existingPartners === 0) {
    await prisma.partner.createMany({ data: PARTNERS });
    console.log(`  ✓ ${PARTNERS.length} partners`);
  }

  /* ------------------------------------------------------- settings */
  const settings: Record<string, string> = {
    applications_open: "true",
    applications_close_date: "2026-09-30",
    stat_entrepreneurs: "100",
    stat_clusters: "4",
    stat_investment_ready: "20",
    stat_funded: "20",
    stat_funding: "480000",
    stat_bootcamp_weeks: "8",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`  ✓ ${Object.keys(settings).length} settings`);

  // Read the counts back rather than trusting that the writes above landed:
  // this is the check that would have caught seeding the wrong database.
  const [cohorts, users, criteria, posts, eventCount] = await Promise.all([
    prisma.cohort.count(),
    prisma.user.count(),
    prisma.scoringCriterion.count(),
    prisma.post.count(),
    prisma.event.count(),
  ]);

  console.log(`\nDone. ${target} now holds:`);
  console.log(
    `  ${cohorts} cohort(s), ${criteria} scoring criteria, ${users} user(s), ` +
      `${posts} post(s), ${eventCount} event(s)`,
  );

  if (cohorts === 0) {
    console.error(
      "\n  No cohort is present after seeding — the portal cannot open " +
        "applications without one.\n",
    );
    process.exit(1);
  }

  console.log(`\n  Admin sign-in: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("  Change that password immediately after your first sign-in.\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
