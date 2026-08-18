import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ · Letter Jar",
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-body">
      <h1 className="font-display text-2xl font-medium text-heading">FAQ</h1>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        What is a letter jar?
      </h2>
      <p className="mt-2">
        A collection of private letters from your friends, gathered in one
        place, sealed, and delivered as a surprise to someone you care about.
        The recipient is the only one who can read what&apos;s inside.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        How does it work?
      </h2>
      <p className="mt-2">
        Start a jar, set a title and who it&apos;s for, then share the invite
        link with your friends. They drop in letters, you seal the jar when
        you&apos;re ready, and sending it generates the one link that lets your
        recipient open everything.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Do my friends need an account to write a letter?
      </h2>
      <p className="mt-2">
        No. Contributors just open the invite link, write their letter, and
        optionally add a photo or gif. Only the person starting the jar needs
        an account.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Does the recipient need an account?
      </h2>
      <p className="mt-2">
        No. When you send the jar, a private link is created that only your
        recipient has. No sign-up needed.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Can I read the letters before I send the jar?
      </h2>
      <p className="mt-2">
        No — nobody can, not even the creator. Letters are sealed until the jar
        is sent, so even the person putting it together gets to experience the
        reveal.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Can letters be anonymous?
      </h2>
      <p className="mt-2">
        Yes. Contributors choose to appear signed or anonymous, and anonymous
        letters stay anonymous forever — even on a public jar.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        What does sealing do?
      </h2>
      <p className="mt-2">
        Sealing closes the jar to new letters. You can seal it manually, at a
        date you pick, or once a set number of letters arrive. Sealing doesn&apos;t
        send it — you still choose when to deliver.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        What if someone wants to add one more letter after sealing?
      </h2>
      <p className="mt-2">
        The creator can reopen a sealed jar to accept more letters. Once the
        jar has been delivered, it&apos;s the recipient&apos;s — it can&apos;t be changed.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Can I attach photos or gifs?
      </h2>
      <p className="mt-2">
        Yes — each letter can include up to 4 images or gifs. They show up as a
        small gallery under the letter text.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        What happens to the email I leave with my letter?
      </h2>
      <p className="mt-2">
        It&apos;s never shown to the creator or other contributors. It&apos;s only used
        to trace abuse if something is reported, and to notify you if the jar
        is later made public.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        Can the recipient share the jar with others?
      </h2>
      <p className="mt-2">
        The recipient can make the jar public, which creates a separate link
        anyone can view. They can unpublish it again any time.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-heading">
        What if I want to get rid of a jar?
      </h2>
      <p className="mt-2">
        While a jar is still open you can delete it, along with any letters
        already written. Once it&apos;s sealed or delivered, you can archive it
        instead — it stays live at its link but is hidden from your dashboard.
      </p>
    </main>
  );
}