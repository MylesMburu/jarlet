import { prisma } from "@/lib/prisma";
import { LetterViewer } from "@/components/letter-viewer";

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
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="font-display font-medium text-lg text-heading">Link not found</h1>
          <p className="mt-2 text-sm text-muted">
            This public link isn&apos;t valid.
          </p>
        </div>
      </main>
    );
  }

  if (!jar.isPublic) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="font-display font-medium text-lg text-heading">
            This jar is private
          </h1>
          <p className="mt-2 text-sm text-muted">
            The recipient has chosen not to share it publicly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      data-theme="reveal"
      className="flex flex-1 justify-center bg-page px-4 py-12"
    >
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="font-display font-medium text-2xl text-heading">{jar.title}</h1>
          <p className="mt-1 text-sm text-muted">
            A letter jar shared publicly, {jar._count.letters} letter
            {jar._count.letters === 1 ? "" : "s"} in all.
          </p>
        </header>

        {jar.letters.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-sm text-muted">
              No signed letters are visible here.
            </p>
          </div>
        ) : (
          <LetterViewer letters={jar.letters} />
        )}
      </div>
    </main>
  );
}