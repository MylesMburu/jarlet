import { prisma } from "@/lib/prisma";
import { LetterCard } from "@/components/letter-card";
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
      },
    },
  });

  if (!jar) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">Link not found</h1>
          <p className="mt-2 text-sm text-zinc-500">
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
    <main className="flex flex-1 justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">{jar.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">for {jar.recipientName}</p>
        </header>

        {jar.letters.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-500">
              This jar is empty.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jar.letters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} />
            ))}
          </div>
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