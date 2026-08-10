"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJar, type SealMode } from "@/lib/actions/create-jar";
import { cn } from "@/lib/utils";

export default function CreateJarForm() {
  const router = useRouter();
  const [sealMode, setSealMode] = useState<SealMode>("manual");
  const [state, formAction, pending] = useActionState(createJar, {});

  useEffect(() => {
    if (state.jarId) {
      router.push(`/jar/${state.jarId}/manage`);
    }
  }, [state.jarId, router]);

  const sealModes: { value: SealMode; label: string; hint: string }[] = [
    { value: "manual", label: "Manual", hint: "You seal it whenever you're ready" },
    { value: "date", label: "On a date", hint: "Auto-seal at a set time" },
    { value: "count", label: "At a letter count", hint: "Auto-seal once N letters arrive" },
  ];

  return (
    <form action={formAction} className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-heading">Title</span>
        <input
          name="title"
          required
          placeholder="e.g. Message to Max on graduation"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-heading">Recipient name</span>
        <input
          name="recipientName"
          required
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
                sealMode === mode.value
                  ? "border-accent bg-accent/5"
                  : "border-line bg-surface hover:border-input"
              )}
            >
              <input
                type="radio"
                name="sealMode"
                value={mode.value}
                checked={sealMode === mode.value}
                onChange={() => setSealMode(mode.value)}
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

      {sealMode === "date" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">Seal date</span>
          <input
            name="sealDate"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {sealMode === "count" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">
            Seal at letter count
          </span>
          <input
            name="sealLetterCount"
            type="number"
            min={1}
            required
            placeholder="e.g. 10"
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {state.error && (
        <p className="text-sm font-medium text-heading">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create jar"}
      </button>
    </form>
  );
}