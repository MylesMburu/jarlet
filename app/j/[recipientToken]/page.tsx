import { prisma } from "@/lib/prisma";
import { LetterViewer } from "@/components/letter-viewer";
import { PublicToggle } from "./public-toggle";

export default async function RecipientPage({
  params,
}: {
  params: Promise<{ recipientToken: string }>;
}) {
  const { recipientToken } = await params;

  const jar = await prisma.jar.findUnique({
    where: { recipientToken },
    select: {
      title: true,
      recipientName: true,
      isPublic: true,
      publicSlug: true,
      status: true,
      letters: {
        orderBy: { createdAt: "asc" },
        include: { media: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!jar) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="font-display font-medium text-lg text-heading">Link not found</h1>
          <p className="mt-2 text-sm text-muted">
            This link isn&apos;t valid.
          </p>
        </div>
      </main>
    );
  }

  const publicUrl = jar.isPublic && jar.publicSlug
    ? `${process.env.AUTH_URL ?? "http://localhost:3000"}/p/${jar.publicSlug}`
    : null;

  return (
    <main
      data-theme="reveal"
      className="flex flex-1 justify-center bg-page px-4 py-12"
    >
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="font-display font-medium text-2xl text-heading">{jar.title}</h1>
          <p className="mt-1 text-sm text-muted">for {jar.recipientName}</p>
          <div aria-hidden className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber" />
        </header>

        {jar.letters.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-sm text-muted">
              This jar is empty.
            </p>
          </div>
        ) : (
          <LetterViewer letters={jar.letters} />
        )}

        <PublicToggle
          recipientToken={recipientToken}
          isPublic={jar.isPublic}
          publicUrl={publicUrl}
        />
      </div>
    </main>
  );
}