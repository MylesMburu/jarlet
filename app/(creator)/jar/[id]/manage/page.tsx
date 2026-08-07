import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { CopyLink } from "@/components/copy-link";
import { SealButton, SendButton } from "./jar-actions";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">{jar.title}</h1>
            <StatusBadge status={jar.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">for {jar.recipientName}</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Invite contributors
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Share this link with anyone you want to leave a letter.
          </p>
          {jar.status !== "open" ? (
            <p className="mt-3 text-sm text-red-600">
              This jar is {jar.status} and no longer accepts letters.
            </p>
          ) : (
            <div className="mt-3">
              <CopyLink url={inviteUrl} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Contributors ({jar._count.letters})
          </h2>
          {jar.letters.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No letters yet. Share the invite link above.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {jar.letters.map((letter) => (
                <li key={letter.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-zinc-800">
                    {letter.displayMode === "anonymous" || !letter.contributorDisplayName
                      ? "Anonymous"
                      : letter.contributorDisplayName}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Delivery
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
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
              <p className="text-sm text-zinc-600">
                Jar sealed. When you&apos;re ready, send it to generate the
                recipient&apos;s private link.
              </p>
              <SendButton jarId={jar.id} />
            </div>
          )}

          {jar.status === "delivered" && recipientUrl && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                Recipient link:
              </p>
              <CopyLink url={recipientUrl} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}