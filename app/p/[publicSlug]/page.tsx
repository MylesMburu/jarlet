import { prisma } from "@/lib/prisma";
import { LetterCard } from "@/components/letter-card";

export const dynamic = "force-dynamic";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ publicSlug: string }>;
}) {
  const { publicSlug } = await params;

  const jar = await prisma.jar.findUnique({
    where: { publicSlug },
    select: {
      title: true,
      recipientName: true,
      isPublic: true,
      letters: {
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { letters: true } },
    },
  });

  if (!jar) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">Link not found</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This public link isn&apos;t valid.
          </p>
        </div>
      </main>
    );
  }

  if (!jar.isPublic) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            This jar is private
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            The recipient has chosen not to share it publicly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">{jar.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            A letter jar shared publicly, {jar._count.letters} letter
            {jar._count.letters === 1 ? "" : "s"} in all.
          </p>
        </header>

        {jar.letters.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-500">
              No signed letters are visible here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jar.letters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}