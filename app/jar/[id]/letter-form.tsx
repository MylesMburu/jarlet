"use client";

import { useActionState, useState } from "react";
import { submitLetter } from "@/lib/actions/submit-letter";
import { cn } from "@/lib/utils";

export default function LetterForm({ inviteToken }: { inviteToken: string }) {
  const [state, formAction, pending] = useActionState(
    submitLetter.bind(null, inviteToken),
    {}
  );
  const [displayMode, setDisplayMode] = useState<"signed" | "anonymous">(
    "signed"
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.publicUrl) {
        throw new Error(data.error ?? "Upload failed");
      }
      setMediaUrl(data.publicUrl);
    } catch {
      setMediaUrl(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Your letter</span>
        <textarea
          name="bodyText"
          required
          rows={6}
          maxLength={50_000}
          placeholder="What would you like to say?"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">
          Photo or GIF{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <input
          type="file"
          accept="image/*,.gif"
          onChange={handleFile}
          className="mt-1 block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
        />
        <input type="hidden" name="mediaUrl" value={mediaUrl ?? ""} />
        {uploading && <p className="mt-2 text-xs text-zinc-500">Uploading…</p>}
        {mediaUrl && (
          <p className="mt-2 text-xs text-emerald-600">Attached.</p>
        )}
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-zinc-700">
          How should you appear?
        </legend>
        <div className="mt-2 flex gap-2">
          <label
            className={cn(
              "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm",
              displayMode === "signed"
                ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600"
            )}
          >
            <input
              type="radio"
              name="displayMode"
              value="signed"
              checked={displayMode === "signed"}
              onChange={() => setDisplayMode("signed")}
              className="sr-only"
            />
            Signed
          </label>
          <label
            className={cn(
              "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm",
              displayMode === "anonymous"
                ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600"
            )}
          >
            <input
              type="radio"
              name="displayMode"
              value="anonymous"
              checked={displayMode === "anonymous"}
              onChange={() => setDisplayMode("anonymous")}
              className="sr-only"
            />
            Anonymous
          </label>
        </div>
      </fieldset>

      {displayMode === "signed" && (
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Your name</span>
          <input
            name="contributorDisplayName"
            required
            placeholder="e.g. Maya"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Your email</span>
        <input
          name="contributorEmail"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Used only for moderation traceability and to let you know if this jar
          is later made public. Never shown to the creator.
        </p>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Add to jar"}
      </button>
    </form>
  );
}