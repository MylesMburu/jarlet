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
        <span className="text-sm font-medium text-zinc-700">Title</span>
        <input
          name="title"
          required
          placeholder="e.g. Message to Max on graduation"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Recipient name</span>
        <input
          name="recipientName"
          required
          placeholder="Who is this jar for?"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">
          Prompt for contributors{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <textarea
          name="prompt"
          rows={3}
          placeholder="e.g. Share your favorite memory from high school"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-zinc-700">Seal mode</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {sealModes.map((mode) => (
            <label
              key={mode.value}
              className={cn(
                "cursor-pointer rounded-lg border p-3 transition-colors",
                sealMode === mode.value
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
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
              <span className="block text-sm font-medium text-zinc-900">
                {mode.label}
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                {mode.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {sealMode === "date" && (
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Seal date</span>
          <input
            name="sealDate"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>
      )}

      {sealMode === "count" && (
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Seal at letter count
          </span>
          <input
            name="sealLetterCount"
            type="number"
            min={1}
            required
            placeholder="e.g. 10"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>
      )}

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create jar"}
      </button>
    </form>
  );
}