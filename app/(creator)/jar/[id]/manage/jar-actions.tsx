"use client";

import { useTransition, useState } from "react";
import { sealJar, sendJar, reopenJar, deleteJar } from "@/lib/actions/manage-jar";

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

export function ReopenButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Reopen this jar for more letters? Contributors will be able to add letters again, and you'll need to seal it once more before sending."
            )
          ) {
            return;
          }
          startTransition(async () => {
            const res = await reopenJar(jarId);
            if (res.error) setError(res.error);
          });
        }}
        className="w-full rounded-lg border border-input bg-surface px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-accent disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Reopening…" : "Reopen for more letters"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}

export function DeleteJarButton({
  jarId,
  letterCount,
}: {
  jarId: string;
  letterCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const message =
    letterCount === 0
      ? "Delete this jar? It's empty and this can't be undone."
      : `This will permanently delete ${letterCount} letter${
          letterCount === 1 ? "" : "s"
        } your friends have already written. Delete this jar?`;

  return (
    <div>
      <button
        disabled={pending}
        onClick={() => {
          if (!window.confirm(message)) return;
          startTransition(async () => {
            const res = await deleteJar(jarId);
            if (res?.error) setError(res.error);
          });
        }}
        className="w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-input disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Deleting…" : "Delete this jar"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-heading">{error}</p>}
    </div>
  );
}

export function ReopenQuickButton({ jarId }: { jarId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span>
      <button
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Reopen this jar for more letters?")) return;
          startTransition(async () => {
            const res = await reopenJar(jarId);
            if (res.error) setError(res.error);
          });
        }}
        className="rounded-lg border border-input bg-surface px-3 py-1.5 text-sm font-medium text-heading transition-colors hover:border-accent disabled:opacity-50"
      >
        {pending ? "Reopening…" : "Reopen"}
      </button>
      {error && <p className="mt-1 text-xs text-muted">{error}</p>}
    </span>
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