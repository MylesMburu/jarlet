import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" aria-label="Letter Jar home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jarlet-icon.svg" alt="Jarlet Icon" className="h-10 w-10" />
      </Link>
      {children}
    </header>
  );
}
