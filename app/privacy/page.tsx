import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · Letter Jar",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-body">
      <h1 className="font-display text-2xl font-medium text-heading">
        Privacy
      </h1>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Letters stay private until they&apos;re sent
      </h2>
      <p className="mt-2">
        A jar&apos;s letters are sealed to everyone — including its creator —
        until the creator chooses to send the jar to its recipient. Only the
        recipient can read them unless they later make the jar public.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Your email when you leave a letter
      </h2>
      <p className="mt-2">
        The email you provide when contributing a letter is never shown to the
        creator or to other contributors. It&apos;s used only to trace abuse if
        something is reported, and to notify you if the jar is later made
        public.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Creator accounts
      </h2>
      <p className="mt-2">
        Creator accounts sign in with an email magic link or Google. Letter
        contents are not readable on the dashboard before delivery.
      </p>
    </main>
  );
}