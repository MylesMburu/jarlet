"use client";

import { useTransition, useState } from "react";
import { archiveJar, unarchiveJar } from "@/lib/actions/manage-jar";

export function ArchiveJarButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Archive this jar? It'll disappear from your dashboard but keep working at its existing links. You can unarchive it anytime."
            )
          ) {
            return;
          }
          startTransition(async () => {
            const res = await archiveJar(jarId);
            if (res.error) setError(res.error);
          });
        }}
        className="w-full rounded-lg border border-input bg-surface px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-accent disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Archiving…" : "Archive this jar"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}

export function UnarchiveJarButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await unarchiveJar(jarId);
            if (res.error) setError(res.error);
          })
        }
        className="w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-input disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Restoring…" : "Unarchive"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}