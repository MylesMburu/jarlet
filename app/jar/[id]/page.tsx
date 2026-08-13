import { prisma } from "@/lib/prisma";
import { jarTheme } from "@/lib/theme";
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
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="font-display font-medium text-lg text-heading">Link not found</h1>
          <p className="mt-2 text-sm text-muted">
            This invite link isn&apos;t valid.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      data-theme={jarTheme(jar.status)}
      className="flex flex-1 items-center justify-center bg-page px-4 py-12"
    >
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center  flex  flex-col justify-center items-center">
          <img src="/jarlet-icon.svg" alt="" className="h-10 w-10" />
          <h1 className="font-display font-medium text-2xl text-heading">{jar.title}</h1>
          <p className="mt-1 text-sm text-muted">
            A letter jar for {jar.recipientName}
          </p>
          {jar.prompt && (
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-line bg-surface px-4 py-3 text-sm text-body">
              {jar.prompt}
            </p>
          )}
        </header>

        {jar.status === "open" ? (
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="mb-4 text-sm font-medium text-heading">
              Drop in your letter
            </h2>
            <LetterForm inviteToken={id} />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-sm font-medium text-heading">
              This jar is closed.
            </p>
            <p className="mt-2 text-sm text-muted">
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