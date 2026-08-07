import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 py-24 text-center">
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
          private letters, sealed with care
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Start a letter jar
        </h1>
        <p className="max-w-md text-lg text-zinc-600">
          Invite friends to drop in private letters, seal the jar, then send it
          to one recipient who can open it.
        </p>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Create a jar
        </Link>
      </main>
    </div>
  );
}
