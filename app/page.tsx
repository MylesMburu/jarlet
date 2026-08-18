import Link from "next/link";
import { auth } from "@/auth";
import { SealCta } from "@/components/seal-cta";
import { JarDrop } from "@/components/jar-drop";

export default async function Home() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Letter Jar home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jarlet-icon.svg" alt="Jarlet Icon" className="h-10 w-10" />
        </Link>
        {isAuthed ? (
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted transition-colors hover:text-heading"
          >
            My jars
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-muted transition-colors hover:text-heading"
          >
            Sign in
          </Link>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 py-24 text-center">
          <JarDrop className="jar-rise jar-rise--jar" />
          <span className="jar-rise jar-rise--badge rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            private letters, sealed with care
          </span>
          <h1 className="jar-rise jar-rise--title font-display font-medium text-4xl text-heading">
            Start a letter jar
          </h1>
          <p className="jar-rise jar-rise--body max-w-md text-lg text-body">
            Invite friends to drop in private letters, seal the jar, then send
            it to one recipient who can open it.
          </p>
          <SealCta className="jar-rise jar-rise--cta" />
        </div>
      </main>

      <footer className="pb-6">
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} Jarlet ·{" "}
          <Link
            href="/privacy"
            className="transition-colors hover:text-heading"
          >
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/faq" className="transition-colors hover:text-heading">
            FAQ
          </Link>
        </p>
      </footer>
    </div>
  );
}