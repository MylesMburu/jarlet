"use client";

import { useTransition, useState } from "react";
import { sealJar, sendJar } from "@/lib/actions/manage-jar";

function useWaxStamp() {
  const [stamped, setStamped] = useState(false);
  return {
    stamped,
    press() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      setStamped(true);
      window.setTimeout(() => setStamped(false), 560);
    },
  };
}

export function SealButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const stamp = useWaxStamp();

  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          stamp.press();
          startTransition(async () => {
            const res = await sealJar(jarId);
            if (res.error) setError(res.error);
          });
        }}
        className="relative w-full overflow-hidden rounded-lg bg-seal px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        <span className="relative z-20">{pending ? "Sealing…" : "Seal jar"}</span>
        {stamp.stamped && <span aria-hidden className="seal-stamp seal-stamp--on-red" />}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}

export function SendButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const stamp = useWaxStamp();

  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          stamp.press();
          startTransition(async () => {
            const res = await sendJar(jarId);
            if (res.error) setError(res.error);
          });
        }}
        className="relative w-full overflow-hidden rounded-lg bg-seal px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        <span className="relative z-20">{pending ? "Sending…" : "Send to recipient"}</span>
        {stamp.stamped && <span aria-hidden className="seal-stamp seal-stamp--on-red" />}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}