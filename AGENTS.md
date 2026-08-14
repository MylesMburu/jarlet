# Jarlet — project context

Jarlet is a web app for creating "letter jars": a creator starts a jar, invites friends
to add private letters via a link, then seals and delivers the jar to a
recipient who is the only one who can read it (unless they later choose to
make it public).

## Access model — the core constraint

Three access levels, each with a different auth story:

1. **Creator** — the only role requiring an account (email/magic-link or
   Google via NextAuth/Auth.js).
2. **Contributor** — no account. Reaches the jar via an unguessable
   `inviteToken` URL. Writes a letter (text + optional photo/gif), chooses
   signed or anonymous display, and provides an email (unverified, used only
   for moderation traceability and for a later "this jar is now public"
   notification — never shown to the creator in normal UI).
3. **Recipient** — no account. Reaches the jar via a separate unguessable
   `recipientToken` URL, generated only when the creator sends the sealed jar.

Nobody — including the creator — can read letter contents before the jar is
sealed and sent. This is the most important invariant in the whole app: do
not build any UI or API path that exposes letter `body_text` or `media_url`
to the creator before `status = delivered`.

## Data model (Prisma / Postgres)

- **User**: id, email, name — creator accounts only.
- **Jar**: id, creatorId, title, recipientName, sealMode (`manual` | `date` |
  `count`), sealDate, sealLetterCount, status (`open` | `sealed` |
  `delivered`), isPublic, inviteToken, recipientToken, publicSlug (nullable),
  archivedAt (nullable, datetime — see "Jar update, delete & archive rules").
- **Letter**: id, jarId, contributorEmail (always stored, never shown to
  creator in normal UI), contributorDisplayName (nullable), displayMode
  (`signed` | `anonymous`), bodyText, mediaUrl (nullable), createdAt.

Anonymous letters stay anonymous everywhere permanently, including on public
pages — there is no "reveal identity" feature.

## Lifecycle rules

- Sealing (manual, date, or count-triggered via a cron job) locks new
  contributions but does NOT auto-send. The creator still explicitly
  triggers delivery. Sealing only ever exposes a letter *count* to the
  creator, never content.
- Only on send does `recipientToken` get generated and the jar become
  reachable at its delivery URL.
- The recipient can toggle `isPublic`. Turning it on generates `publicSlug`
  and should trigger an email notification to every contributor who left an
  email. The recipient can unpublish later.

## Stack

- Next.js (App Router), Postgres via Prisma, NextAuth/Auth.js (creator-only
  auth), Cloudflare R2 or S3 for media (presigned direct uploads from
  browser), Resend or Postmark for email, deployed on Vercel.

## Design system

Two token sets, tied to the jar's emotional state, not applied globally as
one static brand palette:

**`sealed` set** — used for the creator dashboard, jar creation/management,
the invite form, and any "this jar is closed" state. Muted, contained,
private-feeling.
- `ink` #2B2A33 — primary chrome, headers, dark surfaces
- `seal` #7A2E38 — reserved ONLY for seal/send actions and their related
  confirmations. Never reused for cancel, error, or generic primary buttons.
- `parchment` #EDE6D6 — page background
- `brass` #B8925A — borders, dividers, sparing accents
- `sage` #7C8B7F — success/confirmation states (letter submitted, jar sent)
- `ink-text` #4A4640 — body text on parchment

**`reveal` set** — used for the recipient delivery page and the public jar
page only. One register brighter/warmer than `sealed`, so the palette shift
itself signals "you've crossed into the reveal moment."
- `twilight` #3D3550 — dark surfaces on these pages, if used
- `amber` #E3A857 — the one place full saturation is allowed; use for the
  unsealing/reveal moment specifically, not scattered as a general accent
- `glass` #6E9C99 — secondary accent, used for the public/private toggle
- `cream` #F6F0E4 — page background
- `rose` #C97B84 — anonymous-contributor badge (calm, not muted-to-invisible
  — anonymity should not read as a disabled or lesser state)
- `charcoal` #322E38 — body text on cream

Rules to enforce in code, not just in the palette:
- `seal` red is exclusive to seal/send actions.
- Full-saturation `amber` is exclusive to the reveal moment (the recipient's
  first open of a delivered jar) — not a general-purpose accent.
- Which token set is active should be driven by the jar's `status` field
  (`open`/`sealed` → sealed set; `delivered` and the public page → reveal
  set), not hardcoded per page.

## Typography

Three fonts, each with one job — do not use any of them outside their role.

- **Fraunces** — display/headings only (page titles, jar titles). Warm,
  soft-serif, literary feel. Load weight 500, optical size range.
- **Karla** — body text and all UI chrome (forms, buttons, dashboard, labels).
  Weights 400/500.
- **Caveat** — signature accent ONLY. Used exclusively for a signed
  contributor's display name on a letter card/envelope. Anonymous letters
  never use Caveat — they show "Anonymous" in plain Karla, no decorative
  mark or fake signature. Do not use Caveat anywhere else (no taglines,
  no headings, no buttons) — its whole value depends on staying rare.

Google Fonts import: `Fraunces:opsz,wght@9..144,500`, `Karla:wght@400;500`,
`Caveat:wght@500`.

## Interaction & animation principles

Borrow Duolingo's quality of "every action gets tangible, physical-feeling
feedback" — but not its gamification mechanics (no streaks, XP, badges, or
engagement nudges; Jarlet is a one-off sentimental event, not a habit loop).

Confirmed interactions to build:
- **Letter submission** (contributor flow): on submit, animate the letter
  folding/dropping into a small jar illustration, with visible feedback
  that the jar's contents increased.
- **Jar-fill visualization — creator dashboard ONLY.** A jar illustration
  on the dashboard (per-jar, on its card or management page) visually fills
  as letters are added, giving the creator a satisfying at-a-glance sense
  of progress. This does NOT appear on the recipient delivery page or the
  public page — those are one-time reveal moments, not progress trackers.
- **Envelope-open interaction** (recipient/public letter view): letters
  render as a grid of closed, fixed-size envelopes (max width ~170px,
  height ~104px — real envelope proportions, never stretched to fill a
  container). Grid is `repeat(auto-fit, minmax(150px, 1fr))` on tablet/
  desktop, single column on mobile. Tapping an envelope opens it in a
  centered overlay/modal above the grid — the grid itself never resizes
  or reflows when a letter opens, so browsing stays stable regardless of
  letter length. Inside the opened modal: text fades in first, then the
  signature (Caveat for signed names, plain Karla "Anonymous" for
  anonymous — no decorative mark). Only one letter open at a time; closing
  it returns to the grid.
- **Wax-seal press** on primary seal/send actions (already scoped
  separately) — a brief circular stamp in the `seal` color expanding and
  fading from the button's center.
- **Homepage load sequence and ambient jar/letter loop** (already scoped
  separately in the hero animation work).

All animations respect `prefers-reduced-motion`: staggered/looping/ambient
motion collapses to instant-appear; brief user-triggered feedback (stamp,
envelope open) can keep a very short, low-amplitude transition but skip
elaborate easing.

## Global layout — header & footer

Applies site-wide, not just the homepage.

- **Header**: minimal, quiet. Jarlet icon mark only (not the full wordmark —
  16–24px), top-left, linking to `/`. Top-right: a single text link —
  "Sign in" if logged out, "My jars" if the creator is authenticated. No
  nav bar, no menu, nothing else. This exists purely so a returning creator
  has a way back in; it should not compete with any page's own hero/content.
- **Footer**: one muted line, e.g. "© Jarlet · Privacy". Its only real job
  is giving contributors (who are asked for an email on the invite form) a
  place to check what happens with their data before they submit. No link
  farm, no social icons, no multi-column footer.
- Both use the `sealed` token set's neutral tones (ink/brass/muted text) —
  they're chrome, not part of either page's emotional register, so they
  should read as quiet framing regardless of which token set the page body
  is using.

## Jar update, delete & archive rules

Rules are scoped by jar `status` — not a generic CRUD form. A jar containing
other people's letters isn't just the creator's data once contributions
exist.

**Editing:**
- `status = open` — freely editable: title, recipientName, sealMode, and
  the related date/count fields.
- `status = sealed` — locked, except one explicit action: "reopen for more
  letters" (sets status back to `open`). No silent field edits once sealed
  — sealing already implicitly told contributors "this is final."
- `status = delivered` — fully locked from the creator's side. It's the
  recipient's jar now.

**Deleting:**
- `status = open` AND zero letters — hard delete, no confirmation friction
  needed beyond a basic "are you sure."
- `status = open` AND letters exist — hard delete allowed, but the
  confirmation dialog must state the concrete cost, e.g. "This will
  permanently delete N letters your friends have already written," not a
  generic "are you sure you want to delete this jar."
- `status = sealed` or `delivered` — no hard delete. Offer **archive**
  instead (sets `archivedAt`, hides the jar from the default dashboard
  view without deleting data). Reasons: a public jar's link would break for
  contributors who were emailed it, and a delivered jar may still be in use
  by the recipient. Archived jars stay fully functional at their existing
  URLs — archiving only affects the creator's dashboard visibility.
- Archived jars can be unarchived at any time; this reverses only the
  dashboard visibility, not any lifecycle status.

## Conventions

- Route groups: `(creator)/dashboard`, `(creator)/jar/new`,
  `(creator)/jar/[id]/manage`, public `jar/[inviteToken]`,
  `j/[recipientToken]`, `p/[publicSlug]`.
- Rate-limit the public `jar/[inviteToken]` route in middleware — it's the
  most likely target for bot spam once shared.
- Prefer server components for data fetching; keep client components limited
  to interactive form/upload pieces.
- Every API mutation that touches letter content must check jar `status`
  server-side, not just hide UI client-side.