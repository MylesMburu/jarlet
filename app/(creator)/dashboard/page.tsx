import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { JarFill } from "@/components/jar-fill";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  const jars = await prisma.jar.findMany({
    where: { creatorId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { letters: true } } },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-medium text-2xl text-heading">Your jars</h1>
          <p className="mt-1 text-sm text-muted">
            {jars.length === 0
              ? "No jars yet — start your first one."
              : `${jars.length} jar${jars.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/jar/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Create jar
        </Link>
      </div>

      {jars.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-body">
            Create a jar to invite friends to leave letters.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {jars.map((jar) => (
            <li key={jar.id}>
              <Link
                href={`/jar/${jar.id}/manage`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-heading">{jar.title}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    for {jar.recipientName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <JarFill
                    letterCount={jar._count.letters}
                    className="h-12 w-10 shrink-0"
                  />
                  <span className="text-sm text-muted">
                    {jar._count.letters} letter
                    {jar._count.letters === 1 ? "" : "s"}
                  </span>
                  <StatusBadge status={jar.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}