# Letter Jar — project context

A web app for creating "letter jars": a creator starts a jar, invites friends
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
  `delivered`), isPublic, inviteToken, recipientToken, publicSlug (nullable).
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