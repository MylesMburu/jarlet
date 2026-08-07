import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";

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
          <h1 className="text-2xl font-semibold text-zinc-900">Your jars</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {jars.length === 0
              ? "No jars yet — start your first one."
              : `${jars.length} jar${jars.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/jar/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Create jar
        </Link>
      </div>

      {jars.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-600">
            Create a jar to invite friends to leave letters.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {jars.map((jar) => (
            <li key={jar.id}>
              <Link
                href={`/jar/${jar.id}/manage`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-shadow hover:shadow-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">{jar.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    for {jar.recipientName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">
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
