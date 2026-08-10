import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="font-display font-medium text-xl text-heading">Sign in to Letter Jar</h1>
        <p className="mt-2 text-sm text-muted">
          Creator accounts only. We&apos;ll email you a magic link — no password needed.
        </p>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
