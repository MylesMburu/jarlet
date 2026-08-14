"use client";

import { useActionState, useState } from "react";
import { updateJar, type SealMode } from "@/lib/actions/manage-jar";
import { cn } from "@/lib/utils";

type JarSettingsProps = {
  jarId: string;
  editable: boolean;
  title: string;
  recipientName: string;
  prompt: string | null;
  sealMode: SealMode;
  sealDate: string | null;
  sealLetterCount: number | null;
};

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const sealModes: { value: SealMode; label: string; hint: string }[] = [
  { value: "manual", label: "Manual", hint: "You seal it whenever you're ready" },
  { value: "date", label: "On a date", hint: "Auto-seal at a set time" },
  { value: "count", label: "At a letter count", hint: "Auto-seal once N letters arrive" },
];

export default function JarSettings({
  jarId,
  editable,
  title,
  recipientName,
  prompt,
  sealMode,
  sealDate,
  sealLetterCount,
}: JarSettingsProps) {
  const [mode, setMode] = useState<SealMode>(sealMode);
  const [state, formAction, pending] = useActionState(
    updateJar.bind(null, jarId),
    {}
  );

  if (!editable) {
    return (
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Title
          </dt>
          <dd className="mt-1 text-sm text-body">{title}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Recipient
          </dt>
          <dd className="mt-1 text-sm text-body">{recipientName}</dd>
        </div>
        {prompt && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Prompt
            </dt>
            <dd className="mt-1 text-sm text-body">{prompt}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Seal mode
          </dt>
          <dd className="mt-1 text-sm text-body">
            {sealModes.find((m) => m.value === mode)?.label ?? mode}
            {mode === "date" && sealDate
              ? ` · ${new Date(sealDate).toLocaleString()}`
              : ""}
            {mode === "count" && sealLetterCount
              ? ` · ${sealLetterCount} letters`
              : ""}
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-heading">Title</span>
          <input
            name="title"
            defaultValue={title}
            required
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-heading">
            Recipient name
          </span>
          <input
            name="recipientName"
            defaultValue={recipientName}
            required
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-heading">
          Prompt for contributors{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          name="prompt"
          rows={2}
          defaultValue={prompt ?? ""}
          placeholder="e.g. Share your favorite memory from high school"
          className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-heading">Seal mode</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {sealModes.map((m) => (
            <label
              key={m.value}
              className={cn(
                "cursor-pointer rounded-lg border p-3 transition-colors",
                mode === m.value
                  ? "border-accent bg-accent/5"
                  : "border-line bg-surface hover:border-input"
              )}
            >
              <input
                type="radio"
                name="sealMode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="sr-only"
              />
              <span className="block text-sm font-medium text-heading">
                {m.label}
              </span>
              <span className="mt-1 block text-xs text-muted">{m.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "date" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">Seal date</span>
          <input
            name="sealDate"
            type="datetime-local"
            required
            defaultValue={sealDate ? toLocalInput(new Date(sealDate)) : ""}
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {mode === "count" && (
        <label className="block">
          <span className="text-sm font-medium text-heading">
            Seal at letter count
          </span>
          <input
            name="sealLetterCount"
            type="number"
            min={1}
            required
            defaultValue={sealLetterCount ?? ""}
            placeholder="e.g. 10"
            className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {state.error && (
        <p className="text-sm font-medium text-heading">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm font-medium text-sage">Changes saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}