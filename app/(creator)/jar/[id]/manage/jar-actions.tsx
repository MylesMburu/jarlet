"use client";

import { useTransition, useState } from "react";
import { sealJar, sendJar } from "@/lib/actions/manage-jar";

export function SealButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await sealJar(jarId);
            if (res.error) setError(res.error);
          })
        }
        className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Sealing…" : "Seal jar"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function SendButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await sendJar(jarId);
            if (res.error) setError(res.error);
          })
        }
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Sending…" : "Send to recipient"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
