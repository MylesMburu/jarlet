import CreateJarForm from "./create-jar-form";

export const metadata = {
  title: "Create a jar",
};

export default function NewJarPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display font-medium text-2xl text-heading">Create a new jar</h1>
      <p className="mt-1 text-sm text-muted">
        You&apos;ll share an invite link with contributors. Content stays hidden
        until you seal and send the jar.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <CreateJarForm />
      </div>
    </main>
  );
}