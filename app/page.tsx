import { SealCta } from "@/components/seal-cta";
import { JarDrop } from "@/components/jar-drop";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-page px-4">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 py-24 text-center">
        <JarDrop className="jar-rise jar-rise--jar" />
        <span className="jar-rise jar-rise--badge rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
          private letters, sealed with care
        </span>
        <h1 className="jar-rise jar-rise--title font-display font-medium text-4xl text-heading">
          Start a letter jar
        </h1>
        <p className="jar-rise jar-rise--body max-w-md text-lg text-body">
          Invite friends to drop in private letters, seal the jar, then send it
          to one recipient who can open it.
        </p>
        <SealCta className="jar-rise jar-rise--cta" />
      </main>
    </div>
  );
}