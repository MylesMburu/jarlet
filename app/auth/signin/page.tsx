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
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Sign in to Letter Jar</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Creator accounts only. We&apos;ll email you a magic link — no password needed.
        </p>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
