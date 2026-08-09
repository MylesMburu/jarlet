import { prisma } from "@/lib/prisma";
import LetterForm from "./letter-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const jar = await prisma.jar.findUnique({
    where: { inviteToken: id },
    select: { title: true, recipientName: true, prompt: true, status: true },
  });

  if (!jar) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">Link not found</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This invite link isn&apos;t valid.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">{jar.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            A letter jar for {jar.recipientName}
          </p>
          {jar.prompt && (
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              {jar.prompt}
            </p>
          )}
        </header>

        {jar.status === "open" ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-sm font-medium text-zinc-700">
              Drop in your letter
            </h2>
            <LetterForm inviteToken={id} />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-zinc-700">
              This jar is closed.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {jar.status === "delivered"
                ? "It has already been delivered to " + jar.recipientName + "."
                : "It has been sealed and is no longer accepting letters."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}