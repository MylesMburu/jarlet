"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createJar, createJarFromDraft } from "@/lib/actions/create-jar";
import { signInUrl } from "@/lib/callback-url";
import {
  clearDraftJar,
  emptyDraftJar,
  getDraftJarSnapshot,
  subscribeDraftJar,
  writeDraftJar,
  type DraftJar,
  type SealMode,
} from "@/lib/draft-jar";
import { cn } from "@/lib/utils";

const UNLOADED = "unloaded" as const;
type DraftSnapshot = DraftJar | null | typeof UNLOADED;

let autoCreateInFlight = false;

function getClientDraft(): DraftSnapshot {
  return getDraftJarSnapshot();
}

function getServerDraft(): DraftSnapshot {
  return UNLOADED;
}

export default function CreateJarForm({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [override, setOverride] = useState<DraftJar | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [autoCreateFailed, setAutoCreateFailed] = useState(false);
  const [state, formAction, pending] = useActionState(createJar, {});
  const snapshot = useSyncExternalStore(
    subscribeDraftJar,
    getClientDraft,
    getServerDraft
  );

  const loaded = snapshot !== UNLOADED;
  const storedDraft = loaded ? snapshot : null;
  const values = override ?? storedDraft ?? emptyDraftJar;
  const autoCreating =
    isAuthenticated &&
    !autoCreateFailed &&
    loaded &&
    (storedDraft !== null || autoCreateInFlight);

  useEffect(() => {
    if (state.jarId) {
      clearDraftJar();
      router.push(`/jar/${state.jarId}/manage`);
    }
  }, [state.jarId, router]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      autoCreateFailed ||
      !storedDraft ||
      autoCreateInFlight
    ) {
      return;
    }

    autoCreateInFlight = true;
    const draft = storedDraft;
    clearDraftJar();

    void (async () => {
      try {
        const result = await createJarFromDraft(draft);
        if (result.jarId) {
          clearDraftJar();
          router.push(`/jar/${result.jarId}/manage`);
          return;
        }
        writeDraftJar(draft);
        setOverride(draft);
        setLocalError(
          result.error ?? "Could not create the jar. Please try again."
        );
        setAutoCreateFailed(true);
      } catch {
        writeDraftJar(draft);
        setOverride(draft);
        setLocalError("Could not create the jar. Please try again.");
        setAutoCreateFailed(true);
      } finally {
        autoCreateInFlight = false;
      }
    })();
  }, [isAuthenticated, autoCreateFailed, storedDraft, router]);

  function update<K extends keyof DraftJar>(key: K, value: DraftJar[K]) {
    setOverride((current) => ({
      ...(current ?? values),
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (isAuthenticated) return;
    event.preventDefault();
    writeDraftJar(values);
    router.push(signInUrl("/jar/new"));
  }

  const sealModes: { value: SealMode; label: string; hint: string }[] = [
    { value: "manual", label: "Manual", hint: "You seal it whenever you're ready" },
    { value: "date", label: "On a date", hint: "Auto-seal at a set time" },
    { value: "count", label: "At a letter count", hint: "Auto-seal once N letters arrive" },
  ];

  if (!loaded || autoCreating) {
    return (
      <p className="text-sm text-muted">
        {autoCreating ? "Creating your jar…" : "Loading…"}
      </p>
    );
  }

  const error = state.error || localError;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-heading">Title</span>
        <input
          name="title"
          required
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Message to Max on graduation"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-heading">Recipient name</span>
        <input
          name="recipientName"
          required
          value={values.recipientName}
          onChange={(event) => update("recipientName", event.target.value)}
          placeholder="Who is this jar for?"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-heading">
          Prompt for contributors{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          name="prompt"
          rows={3}
          value={values.prompt}
          onChange={(event) => update("prompt", event.target.value)}
          placeholder="e.g. Share your favorite memory from high school"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-heading">Seal mode</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {sealModes.map((mode) => (
            <label
              key={mode.value}
              className={cn(
                "cursor-pointer rounded-lg border p-3 transition-colors",
                values.sealMode === mode.value
                  ? "border-accent bg-accent/5"
                  : "border-line bg-surface hover:border-input"
              )}
            >
              <input
                type="radio"
                name="sealMode"
                value={mode.value}
                checked={values.sealMode === mode.value}
                onChange={() => update("sealMode", mode.value)}
                className="sr-only"
              />
              <span className="block text-sm font-medium text-heading">
                {mode.label}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {mode.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {values.sealMode === "date" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">Seal date</span>
          <input
            name="sealDate"
            type="datetime-local"
            required
            value={values.sealDate}
            onChange={(event) => update("sealDate", event.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {values.sealMode === "count" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">
            Seal at letter count
          </span>
          <input
            name="sealLetterCount"
            type="number"
            min={1}
            required
            value={values.sealLetterCount}
            onChange={(event) => update("sealLetterCount", event.target.value)}
            placeholder="e.g. 10"
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {error && (
        <p className="text-sm font-medium text-heading">{error}</p>
      )}

      <div className="space-y-2">
        {!isAuthenticated && (
          <p className="text-sm text-muted">You&apos;ll sign in to save this jar.</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create jar"}
        </button>
      </div>
    </form>
  );
}
