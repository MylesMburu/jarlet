"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // Auth.js v5 client prefers `redirectTo`; it is posted to the server as
    // `callbackUrl` and baked into the magic-link redirect.
    const result = await signIn("nodemailer", {
      email,
      redirect: false,
      redirectTo: callbackUrl,
      callbackUrl,
    });
    if (result?.error) {
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-lg border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-sage">
        Check your inbox for a sign-in link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-heading">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>
      {status === "error" && (
        <p className="text-sm font-medium text-heading">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
