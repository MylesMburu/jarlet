import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { CopyLink } from "@/components/copy-link";
import { JarFill } from "@/components/jar-fill";
import { SealButton, SendButton, ReopenButton, DeleteJarButton } from "./jar-actions";
import { ArchiveJarButton, UnarchiveJarButton } from "@/components/jar-archive-button";
import JarSettings from "./jar-settings";

export const metadata = {
  title: "Manage jar",
};

export default async function ManageJarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const jar = await prisma.jar.findFirst({
    where: { id, creatorId: session.user.id },
    include: {
      letters: {
        select: {
          id: true,
          contributorDisplayName: true,
          displayMode: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { letters: true } },
    },
  });

  if (!jar) redirect("/dashboard");

  const inviteUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/jar/${jar.inviteToken}`;
  const recipientUrl = jar.recipientToken
    ? `${process.env.AUTH_URL ?? "http://localhost:3000"}/j/${jar.recipientToken}`
    : null;

  const fillCapacity =
    jar.sealMode === "count" && jar.sealLetterCount
      ? jar.sealLetterCount
      : 20;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-medium text-2xl text-heading">{jar.title}</h1>
            <StatusBadge status={jar.status} />
          </div>
          <p className="mt-1 text-sm text-muted">for {jar.recipientName}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <JarFill letterCount={jar._count.letters} capacity={fillCapacity} />
          <p className="text-xs text-muted">
            {jar._count.letters} {jar._count.letters === 1 ? "letter" : "letters"}
            {jar.sealMode === "count" && jar.sealLetterCount
              ? ` / ${jar.sealLetterCount} target`
              : ` / ${fillCapacity}`}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Jar details
          </h2>
          <p className="mt-1 text-sm text-muted">
            {jar.status === "open"
              ? "Edit anything — this jar is still collecting letters."
              : jar.status === "sealed"
                ? "Sealed jars are locked. The only option is to reopen for more letters."
                : "Delivered — this jar belongs to its recipient now and can't be changed."}
          </p>
          <div className="mt-4">
            <JarSettings
              jarId={jar.id}
              editable={jar.status === "open"}
              title={jar.title}
              recipientName={jar.recipientName}
              prompt={jar.prompt}
              sealMode={jar.sealMode as "manual" | "date" | "count"}
              sealDate={jar.sealDate ? jar.sealDate.toISOString() : null}
              sealLetterCount={jar.sealLetterCount}
            />
          </div>
          {jar.status === "sealed" && (
            <div className="mt-4 border-t border-line pt-4">
              <ReopenButton jarId={jar.id} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Invite contributors
          </h2>
          <p className="mt-1 text-sm text-muted">
            Share this link with anyone you want to leave a letter.
          </p>
          {jar.status !== "open" ? (
            <p className="mt-3 text-sm font-medium text-heading">
              This jar is {jar.status} and no longer accepts letters.
            </p>
          ) : (
            <div className="mt-3">
              <CopyLink url={inviteUrl} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Contributors ({jar._count.letters})
          </h2>
          {jar.letters.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No letters yet. Share the invite link above.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {jar.letters.map((letter) => (
                <li key={letter.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-body">
                    {letter.displayMode === "anonymous" || !letter.contributorDisplayName
                      ? "Anonymous"
                      : letter.contributorDisplayName}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Delivery
          </h2>
          <p className="mt-1 text-sm text-muted">
            Seal to lock in letters, then send to deliver the recipient link. You
            can&apos;t read the letters until then.
          </p>

          {jar.status === "open" && (
            <div className="mt-4">
              <SealButton jarId={jar.id} />
            </div>
          )}

          {jar.status === "sealed" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-body">
                <span className="font-medium text-sage">Jar sealed.</span>{" "}
                When you&apos;re ready, send it to generate the recipient&apos;s
                private link.
              </p>
              <SendButton jarId={jar.id} />
            </div>
          )}

          {jar.status === "delivered" && recipientUrl && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-heading">
                Recipient link:
              </p>
              <CopyLink url={recipientUrl} />
            </div>
          )}
        </section>

        {jar.status === "open" ? (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Danger zone
            </h2>
            <p className="mt-1 text-sm text-muted">
              Deletes the jar and everything inside it. Only available while
              the jar is still open.
            </p>
            <div className="mt-4">
              <DeleteJarButton
                jarId={jar.id}
                letterCount={jar._count.letters}
              />
            </div>
          </section>
        ) : jar.archivedAt ? (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Archived
            </h2>
            <p className="mt-1 text-sm text-muted">
              This jar is archived — hidden from your dashboard, but its
              invite, delivery, and public links still work.
            </p>
            <div className="mt-4">
              <UnarchiveJarButton jarId={jar.id} />
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Archive
            </h2>
            <p className="mt-1 text-sm text-muted">
              Archiving hides this jar from your dashboard without deleting
              anything. Its invite, delivery, and public links keep working.
            </p>
            <div className="mt-4">
              <ArchiveJarButton jarId={jar.id} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}