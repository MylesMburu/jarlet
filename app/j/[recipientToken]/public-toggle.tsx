"use client";

import { useTransition, useState } from "react";
import { setJarPublic, setJarPrivate } from "@/lib/actions/public-jar";
import { cn } from "@/lib/utils";

export function PublicToggle({
  recipientToken,
  isPublic,
  publicUrl,
}: {
  recipientToken: string;
  isPublic: boolean;
  publicUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Public access
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {isPublic
              ? "This jar is public. Anyone with the link can read it."
              : "Making this jar public shares it with a link and notifies every contributor."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = isPublic
                ? await setJarPrivate(recipientToken)
                : await setJarPublic(recipientToken);
              if (res.error) setError(res.error);
            })
          }
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
            isPublic
              ? "bg-zinc-500 hover:bg-zinc-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          {pending
            ? "Updating…"
            : isPublic
              ? "Make private"
              : "Make this jar public"}
        </button>

        {isPublic && publicUrl && (
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(publicUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400"
          >
            {copied ? "Copied" : "Copy public link"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}