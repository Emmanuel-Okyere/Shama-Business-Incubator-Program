# Shama Business Incubator

The public website and programme-management platform for the Shama Business
Incubator — an entrepreneurship programme identifying, training, mentoring and
funding 100 young entrepreneurs in the Shama Constituency, Western Region,
Ghana — 25 in each of four clusters.

**Ignite Ideas. Fund Potential. Scale Impact.**

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma and
PostgreSQL. Programme SMS is delivered through [GiantSMS](https://giantsms.com).

---

## What is built

### Public website
Every destination in the PRD's primary navigation, designed from the programme
deck's own palette and photography.

| Route | What it does |
| --- | --- |
| `/` | Hero, opportunity, pipeline, clusters, journey, value proposition, live figures, funding model, impact, news, partner CTA |
| `/about` | Programme overview, the opportunity, cohort timeline, FAQ |
| `/how-it-works` | Identify → Train → Mentor → Pitch → Fund → Scale, plus the three-phase bootcamp and pitch pipeline |
| `/clusters`, `/clusters/[slug]` | The four clusters, with eligible business areas, training focus, participants and mentors |
| `/programme-journey` | The eight tracked stages, expanded |
| `/entrepreneurs` | Public business directory, filterable by cluster (consent-gated) |
| `/mentorship` | How matching works, the mentor pool, and mentor registration |
| `/funding` | Tiered grant model, judging criteria, post-award accountability |
| `/partners` | Sponsorship levels, fundraising networks, partner enquiry form |
| `/impact` | Live impact dashboard driven from the programme database |
| `/news`, `/news/[slug]`, `/events` | Admin-managed content |
| `/contact` | Category-routed enquiries with SMS acknowledgement |
| `/apply` | Eligibility, what to prepare, and the entry point to the portal |
| `/privacy` | Data collection, consent, role-based access, retention |

### Application portal
- Account creation, then a five-step application that **saves at every step**
  so an applicant can leave and come back.
- Eligibility is enforced server-side (age 18–35 is checked against date of
  birth, not self-declared).
- Document upload for identification, business registration, pitch deck,
  business plan, product images and financial information.
- Explicit, separated consent: processing consent is required to submit;
  consent to publish a public business profile is optional and independent.
- On submission the applicant gets a reference number and a confirmation SMS.
- `/portal` shows live application status against the full status flow.

### Admin
- Overview: applications by status and cluster, seats filled, SMS delivery,
  and what needs attention.
- Applicant database with search, filters and **CSV export** (UTF-8 with BOM,
  so Ghanaian names survive Excel).
- Application review: full submission, documents, internal notes, and a
  weighted scorecard across the seven programme criteria.
- Status pipeline — moving an applicant to Shortlisted, Interview, Selected or
  Not Selected sends the matching SMS.
- Communications centre: targeted broadcasts with live segment/credit
  counting, the automatic template list, account balance and a message log.
- Enquiries, mentor volunteers and the partner fundraising pipeline.
- Programme settings: applications open/closed, deadline, homepage figures and
  impact indicators — all published to the public site without a deploy.
- **Cohorts**: create Cohort 2, 3 and beyond with their own dates, seats and
  application window, and choose which one is live. A new cohort starts with
  the programme's seven standard scoring criteria.
- **Per-cohort scoring criteria and application questions**, editable without a
  developer (PRD §9.4, §48). Both refuse to delete anything people have already
  scored or answered against, and offer to deactivate instead.
- **Content**: news posts, events and partner listings, publishing straight to
  the public site.
- **Team**: create administrator, facilitator, judge and mentor accounts. Only
  a super administrator can do this.

Everything the seed creates can be created and edited in the admin UI. The seed
exists to bootstrap the first cohort and the first administrator on a fresh
database, not because the data is fixed.

---

## Getting started

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL and AUTH_SECRET
npm run db:deploy           # apply migrations
npm run db:seed             # cohort, criteria, admin account, demo content
npm run dev
```

The seed prints the administrator sign-in. **Change that password immediately.**

### Database changes

Migrations live in `prisma/migrations`. After editing `prisma/schema.prisma`:

```bash
npm run db:migrate          # prisma migrate dev — writes a new migration
```

Commit the generated migration with the code that needs it. `npm run build`
applies pending migrations before compiling, so deploying the branch deploys
the schema too.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Postgres connection used at runtime |
| `DIRECT_URL` | yes | Direct connection for Prisma Migrate |
| `AUTH_SECRET` | yes | Signs 15-minute access tokens (`openssl rand -base64 32`) |
| `AUTH_REFRESH_SECRET` | recommended | Signs 30-day refresh tokens; derived from `AUTH_SECRET` if unset |
| `GIANTSMS_API_TOKEN` | for SMS | Basic token from your GiantSMS profile |
| `GIANTSMS_USERNAME` / `GIANTSMS_PASSWORD` | alternative | Raw credentials, encoded for you |
| `GIANTSMS_SENDER_ID` | for SMS | Approved sender ID, 11 characters max |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Set automatically when you add Vercel Blob |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata and SMS links |

The public site degrades gracefully: with no `DATABASE_URL` it still renders
and deploys, falling back to the programme defaults, and the portal reports
that it is not yet connected rather than crashing.

---

## Deploying to Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Create a Postgres database (Neon, Vercel Postgres or Supabase) and set
   `DATABASE_URL` and `DIRECT_URL`.
3. Set `AUTH_SECRET` and `AUTH_REFRESH_SECRET` — two different random strings.
4. Add **Vercel Blob** storage so applicants can upload documents;
   `BLOB_READ_WRITE_TOKEN` is injected for you.
5. Add the GiantSMS variables.
6. Deploy. **Migrations run automatically** — `npm run build` is
   `node scripts/migrate.mjs && next build`, so every deployment applies its
   pending migrations before the app is compiled. No custom build command and
   no manual step.
7. Once, after the first successful deploy, seed the cohort, scoring criteria
   and administrator account. **Pass the hosted database URL explicitly** —
   otherwise the seed reads your local `.env` and seeds your development
   database instead, which succeeds and leaves the deployment empty:
   ```bash
   DATABASE_URL="postgresql://…your hosted database…" npm run db:seed
   ```
   The seed prints the database it is writing to and the row counts it read
   back afterwards, so check that output names the hosted host, not
   `localhost`. Without a cohort the portal cannot open applications, so the
   seed exits non-zero if one is not present when it finishes.

`prisma generate` runs on `postinstall`.

Two deliberate behaviours in `scripts/migrate.mjs`:

- **No `DATABASE_URL`** — migrations are skipped and the build continues, so the
  public site can be deployed and reviewed before Postgres is attached.
- **A migration fails** — the build stops, rather than shipping code against a
  schema that does not match it.

Seeding stays manual: it is a one-time bootstrap, not something that should run
on every deployment. It is written with upserts, so re-running it is safe.

### If the portal says it is unavailable

The portal names the specific problem rather than always blaming
`DATABASE_URL`. Match the message you see:

| Message | Cause | Fix |
| --- | --- | --- |
| *The application portal is not connected yet* | `DATABASE_URL` is genuinely absent at runtime | Set it, and **redeploy** — on Vercel an environment variable only reaches a deployment built after it was added. Check it is set for the environment you are viewing (Production / Preview / Development). |
| *No cohort is open yet* | The database is reachable but empty of programme data | Seed it, passing the URL explicitly: `DATABASE_URL="postgresql://…" npm run db:seed`. Seeding a local database while the deployment points at a hosted one is the usual cause — the seed prints its target, so check that line. |
| *Temporarily unavailable* + a deployment detail | The connection itself failed | The detail says which: wrong host or port, missing database, or rejected credentials. |

Two connection-string details that bite on hosted Postgres:

- Most hosted providers require TLS — append `?sslmode=require`.
- Use the **pooled** connection string for `DATABASE_URL` and the **direct**
  one for `DIRECT_URL`. Serverless functions open many short-lived
  connections, and a direct URL will exhaust the connection limit under load
  while appearing to work in testing.

The full error, code frame and all, is written to the deployment log; only a
one-line summary is shown on the page.

---

## Authentication

Stateless JWT access tokens with database-backed, rotating refresh tokens.

- **Access token** — HS256, 15 minutes, carries identity and role. Verifying it
  is a signature check with no database round-trip, so it also runs on the edge.
- **Refresh token** — HS256, 30 days. Each issued token is recorded (SHA-256
  hashed) so it can be rotated and revoked; a stateless refresh token cannot be
  taken away from a stolen device.
- **Rotation** — every refresh mints a new pair and retires the old token in the
  same transaction.
- **Reuse detection** — presenting a token that was already rotated away is
  replay or theft, so the entire token family descended from that login is
  revoked and the user must sign in again.
- **Silent refresh** — `src/proxy.ts` gates protected routes on the access
  token alone. When it has expired but a refresh token is present, the
  navigation is routed through `/api/auth/refresh`, which rotates the pair and
  redirects back; the 15-minute expiry is invisible to the user.

Browsers keep both tokens in httpOnly cookies — that is transport, not the auth
model. The same tokens work as `Authorization: Bearer` for API clients.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create an applicant account, returns a token pair |
| `POST /api/auth/login` | Exchange credentials for a token pair |
| `POST /api/auth/refresh` | Rotate a refresh token (body or cookie) |
| `GET /api/auth/refresh?next=` | Browser silent-refresh redirect |
| `POST /api/auth/logout` | Revoke the token family and clear cookies |
| `GET /api/auth/me` | Current user from the access token |

Roles: `APPLICANT`, `PARTICIPANT`, `MENTOR`, `FACILITATOR`, `JUDGE`, `ADMIN`,
`SUPER_ADMIN`. `/admin` requires an admin role, checked in the proxy and again
in every admin action.

---

## SMS (GiantSMS)

`src/lib/sms.ts` wraps the documented API
([reference](https://documenter.getpostman.com/view/16317044/TzeZF6uf)).
The gateway always answers HTTP 200 and signals success with a boolean `status`
field, so every response body is inspected rather than the status code trusted.

Supported: send, bulk send, delivery status, balance, sender IDs, OTP send and
OTP verify. Ghanaian numbers are normalised to the local `0XXXXXXXXX` form the
gateway expects, accepting `+233…`, `233…` and spaced or dashed input.

`src/lib/notify.ts` holds the programme templates (submission confirmation,
shortlist, interview, selection, rejection, session and deadline reminders,
pitch notices, funding awards, enquiry acknowledgements) and records every
message in the `Notification` table. **Sending never throws**: an application
still submits, and a status change still applies, if the gateway is down — the
failure is persisted and surfaced to admins instead.

Message length is counted with real GSM-7/UCS-2 segment rules, so the admin
composer shows the true credit cost before a broadcast goes out.

---

## Project layout

```
prisma/schema.prisma      Core entities (PRD §51)
prisma/migrations/        Versioned schema history, applied on build
prisma/seed.ts            Cohort, criteria, admin, demo content
scripts/migrate.mjs       Runs migrations as the first half of the build
src/app/(public)/         Public website
src/app/(auth)/           Sign in and registration
src/app/portal/           Applicant dashboard
src/app/admin/            Programme administration
src/app/api/              Auth endpoints and CSV export
src/lib/programme.ts      Programme content model
src/lib/jwt.ts            Token signing and verification (edge-safe)
src/lib/auth.ts           Issuing, rotation, revocation, session
src/lib/sms.ts            GiantSMS client
src/lib/notify.ts         Templates and delivery recording
src/proxy.ts              Route protection and silent refresh
src/lib/form-values.ts    Echoes a rejected submission back into the form
public/brand/             Imagery and logo extracted from the programme deck
```

## Two decisions worth knowing about

**Public pages render per request.** The header shows who is signed in, which
means reading the session, which opts those routes out of the static shell.
Keeping them static would mean enabling Cache Components and streaming the
header behind Suspense — an app-wide migration. Showing a signed-in visitor a
"Sign in" button was the worse trade.

**Forms echo rejected submissions back.** React resets a `<form action={…}>`
once its action settles, including when the action settled by rejecting the
input — so without help a validation error throws away everything typed. Actions
return the submission in their state and fields read from it. Selects and
checkboxes additionally carry a `key`, because a form reset restores them to the
option marked selected at mount and ignores a new `defaultValue` on re-render.

## Brand

Taken directly from the programme deck: lime `#8AB61A`, olive `#587118`, soft
lime `#B2D161` / `#CEDFA1`, cream `#FFEACE`, ink `#0F1126`, and the Emelia
Arthur red `#DB000E` as a sparing accent. Ubuntu for display, Public Sans for
body — both from the deck. The cream corner-bracket motif around lime labels is
lifted from the deck's cluster slide and reused as the site's section marker.

Each cluster has its own illustrated scene in `public/brand/clusters` — a
canoe and catch for Fisheries, a tailor's bench for Creative Craft, a farmer
and crop rows for Agric, a phone and circuitry for Tech. They are drawn as SVG
in the brand palette, so the four read as one set at any size and Fisheries
finally looks like fishing rather than a stretch of coastline. Photography
carries the page headers; the illustrations carry the cards.

---

## Not yet built

Deliberately out of scope for this build, and modelled in the schema so they do
not require a data migration later: participant portal and calendar, attendance,
assignments and submissions, mentor dashboards and session tracking, pitch
events and digital judging, funding disbursement records, and post-programme
Growth Lab reporting.
