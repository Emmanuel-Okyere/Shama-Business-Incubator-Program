/**
 * Programme content model.
 *
 * Everything the public site renders that is *not* live database data lives
 * here, shaped the same way the admin-managed records are shaped. Figures the
 * PRD requires to be editable (§6.2, §49) are read from the `settings` table
 * at runtime and fall back to these defaults.
 */

export const PROGRAMME = {
  name: "Shama Business Incubator",
  shortName: "Shama Incubator",
  tagline: "Ignite Ideas. Fund Potential. Scale Impact.",
  deckTagline: "Ignite. Fund. Scale.",
  cohort: "Cohort 1",
  period: "August – December 2026",
  initiator: "Hon. Emelia Arthur",
  initiatorRole:
    "Member of Parliament for Shama Constituency and Minister for Fisheries and Aquaculture Development",
  constituency: "Shama Constituency, Western Region, Ghana",
  email: "hello@shamaincubator.org",
  phone: "+233 24 000 0000",
  address: "Shama District Assembly, Shama, Western Region, Ghana",
  ageRange: "18–35",
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    x: "https://x.com",
  },
} as const;

export const NAV = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Clusters", href: "/clusters" },
  { label: "Journey", href: "/programme-journey" },
  { label: "Entrepreneurs", href: "/entrepreneurs" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Funding", href: "/funding" },
  { label: "Partners", href: "/partners" },
  { label: "Impact", href: "/impact" },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
] as const;

export type ClusterSlug =
  | "creative-craft"
  | "agric-agribusiness"
  | "fisheries-aquaculture"
  | "tech-innovation";

export interface Cluster {
  slug: ClusterSlug;
  name: string;
  short: string;
  blurb: string;
  focus: string[];
  training: string[];
  seats: number;
  accent: string;
  tint: string;
  /** Illustrated cluster scene used on cards and thumbnails. */
  art: string;
  /** Photograph used full-bleed behind the cluster page header. */
  photo: string;
  icon: "craft" | "agric" | "fish" | "tech";
}

export const CLUSTERS: Cluster[] = [
  {
    slug: "creative-craft",
    name: "Creative Craft",
    short: "Craft",
    blurb:
      "Makers turning skill and culture into products people pay for — from fashion floors to jewellery benches.",
    focus: [
      "Fashion & apparel",
      "Shoemaking & leatherwork",
      "Cosmetology & beauty",
      "Sculpture, crafts & art",
      "Jewellery & accessories",
    ],
    training: [
      "Product costing & pricing for handmade goods",
      "Brand identity and visual storytelling",
      "Production planning and quality consistency",
      "Retail, wholesale and export channels",
    ],
    seats: 25,
    accent: "#db000e",
    tint: "#fff1f1",
    art: "/brand/clusters/creative-craft.svg",
    photo: "/brand/founder-craft.webp",
    icon: "craft",
  },
  {
    slug: "agric-agribusiness",
    name: "Agric & Agri-businesses",
    short: "Agric",
    blurb:
      "Farms and agro-processors building the value chains that keep money and jobs inside Shama.",
    focus: [
      "Crop & livestock farming",
      "Agro-processing & packaging",
      "Agritech & farm services",
      "Distribution & aggregation",
    ],
    training: [
      "Yield economics and input planning",
      "Post-harvest handling and value addition",
      "Certification, packaging and shelf-readiness",
      "Offtake agreements and market linkage",
    ],
    seats: 25,
    accent: "#75990f",
    tint: "#f6faec",
    art: "/brand/clusters/agric.svg",
    photo: "/brand/founder-agric.webp",
    icon: "agric",
  },
  {
    slug: "fisheries-aquaculture",
    name: "Fisheries & Aquaculture",
    short: "Fisheries",
    blurb:
      "Shama's coastline is its advantage. This cluster turns the catch into cold chains, brands and export-grade products.",
    focus: [
      "Fish farming & hatcheries",
      "Seafood processing & value addition",
      "Cold-chain logistics",
      "Fishing inputs & services",
    ],
    training: [
      "Pond and stock management economics",
      "Food safety, handling and traceability",
      "Cold-chain design on a small budget",
      "Branding and selling processed seafood",
    ],
    seats: 25,
    accent: "#0e7490",
    tint: "#effafc",
    art: "/brand/clusters/fisheries.svg",
    photo: "/brand/photo-shama-coast.webp",
    icon: "fish",
  },
  {
    slug: "tech-innovation",
    name: "Tech & Innovation",
    short: "Tech",
    blurb:
      "Founders building software, digital services and automation for Ghanaian problems worth solving.",
    focus: [
      "Software startups & apps",
      "Digital services agencies",
      "Automation & hardware",
      "Data, fintech & platforms",
    ],
    training: [
      "Problem validation and MVP discipline",
      "Unit economics for digital products",
      "Go-to-market and customer acquisition",
      "Fundraising narrative and metrics",
    ],
    seats: 25,
    accent: "#4f46e5",
    tint: "#f2f2fe",
    art: "/brand/clusters/tech.svg",
    photo: "/brand/photo-branding.webp",
    icon: "tech",
  },
];

export const PIPELINE = [
  {
    key: "identify",
    title: "Identify",
    line: "High-potential entrepreneurs aged 18–35 across Shama.",
    detail:
      "Community outreach, information sessions and an open online application surface founders who would otherwise never reach a programme like this.",
  },
  {
    key: "train",
    title: "Train",
    line: "An intensive 8-week bootcamp with real deliverables.",
    detail:
      "Business models, financial literacy, branding, market validation, operations and scalability — taught by practitioners, assessed by assignment.",
  },
  {
    key: "mentor",
    title: "Mentor",
    line: "One-on-one guidance from operators who have done it.",
    detail:
      "Every participant is matched to a mentor by cluster and business need, with tracked check-ins and action points.",
  },
  {
    key: "pitch",
    title: "Pitch",
    line: "Internal cluster pitches, then the Ultimate Pitch.",
    detail:
      "Top five per cluster advance. Twenty finalists pitch before judges, investors and stakeholders with digital scoring.",
  },
  {
    key: "fund",
    title: "Fund",
    line: "GHS 480,000 in grant capital, allocated on performance.",
    detail:
      "Tiered grants from GHS 10,000 to GHS 50,000 go to twenty businesses, with disbursement and use-of-funds tracked.",
  },
  {
    key: "scale",
    title: "Scale",
    line: "Quarterly Growth Labs and continuous mentorship.",
    detail:
      "The programme does not end at graduation. Businesses report performance, keep their mentors and showcase annually.",
  },
] as const;

export const JOURNEY = [
  { stage: "Application", detail: "Discover the programme and submit an application online." },
  { stage: "Selection", detail: "Applications are reviewed, scored, shortlisted and assessed." },
  { stage: "Onboarding", detail: "Selected participants onboard and are matched with mentors." },
  { stage: "8-Week Bootcamp", detail: "Business models, finance, branding, validation, operations, scale." },
  { stage: "Internal Pitch", detail: "Pitch within your cluster. Top five per cluster progress." },
  { stage: "Ultimate Pitch", detail: "Twenty finalists pitch before judges, investors and stakeholders." },
  { stage: "Funding", detail: "Grant capital allocated on pitch performance." },
  { stage: "Growth", detail: "Post-programme support, Growth Labs and impact tracking." },
] as const;

export const VALUE_PROPS = [
  {
    title: "Business & Financial Training",
    photo: "/brand/photo-bootcamp.webp",
    intro: "Practical knowledge to run and grow a venture:",
    points: [
      "Business model development and strategy",
      "Costing, pricing and revenue planning",
      "Financial literacy, bookkeeping and cash flow",
    ],
  },
  {
    title: "Branding & Marketing Support",
    photo: "/brand/photo-branding.webp",
    intro: "Position and sell your product effectively:",
    points: [
      "Brand identity development",
      "Storytelling and communication",
      "Digital marketing and customer acquisition",
    ],
  },
  {
    title: "One-on-One Mentorship",
    photo: "/brand/photo-mentorship.webp",
    intro: "Paired with experienced mentors who provide:",
    points: [
      "Personalised guidance and feedback",
      "Industry-specific insight",
      "Support navigating real business challenges",
    ],
  },
  {
    title: "Investor Readiness",
    photo: "/brand/photo-investor-readiness.webp",
    intro: "Prepared to attract and manage funding:",
    points: [
      "Pitch development and presentation skills",
      "Financial projections and valuation basics",
      "Understanding investor expectations",
    ],
  },
] as const;

export const FUNDING_TIERS = [
  {
    tier: "Top 4 Winners",
    count: 4,
    amount: 50000,
    note: "High-potential, scalable businesses ready for rapid growth.",
  },
  {
    tier: "1st Runner-Ups",
    count: 4,
    amount: 30000,
    note: "Strong businesses with clear market traction and expansion potential.",
  },
  {
    tier: "2nd Runner-Ups",
    count: 4,
    amount: 20000,
    note: "Promising ventures needing support to strengthen operations.",
  },
  {
    tier: "Remaining Finalists",
    count: 8,
    amount: 10000,
    note: "Early-stage businesses with viable ideas and growth potential.",
  },
] as const;

export const TOTAL_FUNDING = FUNDING_TIERS.reduce(
  (sum, t) => sum + t.count * t.amount,
  0,
);

export const SPONSOR_LEVELS = [
  {
    level: "Supporter",
    amount: 100000,
    benefits: [
      "Logo on the programme website and materials",
      "Recognition at the Ultimate Pitch",
      "Programme impact report",
    ],
  },
  {
    level: "Growth Partner",
    amount: 200000,
    benefits: [
      "Everything in Supporter",
      "Named cluster sponsorship",
      "Two mentor placements",
      "Feature in the Annual Cohort Exit",
    ],
  },
  {
    level: "Strategic Partner",
    amount: 500000,
    benefits: [
      "Everything in Growth Partner",
      "Named training track",
      "Seat on the judging panel",
      "Co-branded impact campaign",
    ],
  },
  {
    level: "Title Sponsor",
    amount: 1000000,
    benefits: [
      "Everything in Strategic Partner",
      "Programme naming rights for the cohort",
      "Headline placement across all assets",
      "Executive seat on the programme advisory board",
    ],
  },
] as const;

export const PARTNER_CATEGORIES = [
  {
    name: "Corporate & Institutional Partners",
    detail:
      "Banks, telcos, fisheries and agribusiness corporates funding clusters aligned to their value chains.",
  },
  {
    name: "Ministerial Network & Strategic Supporters",
    detail:
      "Government agencies and development partners supporting youth enterprise in the Western Region.",
  },
  {
    name: "Sons & Daughters of Shama",
    detail:
      "Individuals from Shama, at home and in the diaspora, backing entrepreneurs from their own community.",
  },
] as const;

export const EXPECTED_IMPACT = [
  "100 trained entrepreneurs",
  "20 investment-ready businesses",
  "20 high-growth funded ventures",
  "Job creation across sectors",
  "A strengthened local economy",
] as const;

export const BEYOND_INCUBATOR = [
  {
    n: "01",
    title: "Quarterly Growth Labs",
    points: [
      "Track business performance and progress",
      "Address emerging challenges and bottlenecks",
      "Advanced training in scaling, operations and finance",
      "Peer learning and accountability",
    ],
  },
  {
    n: "02",
    title: "Continuous Mentorship",
    points: [
      "Ongoing one-on-one check-ins",
      "Strategic guidance at critical growth stages",
      "Industry-specific problem solving",
    ],
  },
  {
    n: "03",
    title: "Annual Cohort Exit",
    points: [
      "Showcase businesses to investors and partners",
      "Highlight success stories and measurable impact",
      "Create visibility and market opportunities",
      "Attract new partners for future cohorts",
    ],
  },
] as const;

export const TIMELINE = [
  {
    month: "July",
    phase: "Fundraising & Partnership Development",
    deliverables: [
      "Funding commitments secured",
      "Partnership agreements signed",
      "Mentor pool established",
    ],
  },
  {
    month: "August",
    phase: "Programme Design & Launch Preparation",
    deliverables: [
      "Programme curriculum completed",
      "Applications open",
      "Marketing campaign launched",
    ],
  },
  {
    month: "September",
    phase: "Recruitment & Selection",
    deliverables: [
      "Cohort of 100 entrepreneurs selected",
      "Participants onboarded",
      "Mentorship assignments completed",
    ],
  },
  {
    month: "October",
    phase: "Business Incubation — Weeks 1–4",
    deliverables: ["Business concepts validated", "Draft business plans developed"],
  },
  {
    month: "November",
    phase: "Business Incubation — Weeks 5–8",
    deliverables: [
      "Investment-ready businesses",
      "Internal cluster pitches held",
      "20 finalists selected",
    ],
  },
  {
    month: "December",
    phase: "Ultimate Pitch, Funding & Graduation",
    deliverables: [
      "Grants awarded to 20 businesses",
      "Cohort graduated",
      "Growth Labs scheduled",
    ],
  },
] as const;

export const OPPORTUNITY = [
  "High youth unemployment in Shama and the Western Region",
  "Strong entrepreneurial interest but low business survival rates",
  "Limited access to funding",
  "Weak business structures",
  "Lack of mentorship and networks",
] as const;

export const FAQS = [
  {
    q: "Who can apply?",
    a: "Entrepreneurs aged 18–35 who live or operate a business within the Shama Constituency, in one of the four programme clusters. Your business can be an idea, an early-stage venture or an operating business.",
  },
  {
    q: "Does my business need to be registered?",
    a: "No. Registration is not required to apply. If you are selected, the programme will support you through formalisation where it makes sense for your business.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing. Training, mentorship, pitch coaching and the grant capital are fully funded by the programme and its partners.",
  },
  {
    q: "Is the funding a loan?",
    a: "No. The GHS 480,000 is grant funding. It is not repaid, but it is tied to your pitch performance and comes with reporting obligations on how the money is used.",
  },
  {
    q: "Do I have to attend in person?",
    a: "The 8-week bootcamp is delivered in Shama with in-person sessions. Attendance is tracked and counts toward your standing in the programme.",
  },
  {
    q: "Can I apply with a co-founder?",
    a: "Apply as the lead founder. Name your co-founder in the application — a seat in the cohort is allocated to one person per business.",
  },
  {
    q: "What happens after the programme ends?",
    a: "You stay in the ecosystem: quarterly Growth Labs, continued access to your mentor, and the Annual Cohort Exit where businesses are showcased to investors and partners.",
  },
  {
    q: "How will I know the outcome of my application?",
    a: "You can track your application status any time from your dashboard, and the programme sends an SMS to the phone number on your application at each stage.",
  },
] as const;

export const ENQUIRY_CATEGORIES = [
  "Application",
  "Partnership",
  "Sponsorship",
  "Mentorship",
  "Media",
  "General Enquiry",
] as const;

export const GHS = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function ghs(amount: number) {
  return GHS.format(amount).replace("GH₵", "GHS ");
}

export function clusterBySlug(slug: string) {
  return CLUSTERS.find((c) => c.slug === slug);
}
