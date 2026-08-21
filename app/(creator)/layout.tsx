import Link from "next/link";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { signInUrl } from "@/lib/callback-url";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div
      data-theme="sealed"
      className="flex min-h-screen flex-col bg-page"
    >
      {session?.user ? (
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="font-semibold text-heading">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/jarlet-icon.svg" alt="" className="h-10 w-10" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/jar/new"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Create jar
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm font-medium text-muted hover:text-heading"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
      ) : (
        <SiteHeader>
          <Link
            href={signInUrl("/jar/new")}
            className="text-sm font-medium text-muted transition-colors hover:text-heading"
          >
            Sign in
          </Link>
        </SiteHeader>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
