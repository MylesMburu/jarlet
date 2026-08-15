"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { submitLetter } from "@/lib/actions/submit-letter";
import { JarConfirmation } from "@/components/jar-confirmation";
import { MAX_MEDIA_PER_LETTER } from "@/lib/storage";
import { cn } from "@/lib/utils";

type UploadItem = {
  key: string;
  file: File;
  url: string | null;
  status: "uploading" | "done" | "error";
};

let keyCounter = 0;
const nextKey = () => `up-${++keyCounter}`;

export default function LetterForm({ inviteToken }: { inviteToken: string }) {
  const [state, formAction, pending] = useActionState(
    submitLetter.bind(null, inviteToken),
    {}
  );
  const [displayMode, setDisplayMode] = useState<"signed" | "anonymous">(
    "signed"
  );
  const [items, setItems] = useState<UploadItem[]>([]);

  const uploading = items.some((i) => i.status === "uploading");
  const doneUrls = items
    .filter((i) => i.status === "done" && i.url)
    .map((i) => i.url as string);

  function patchItem(key: string, patch: Partial<UploadItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  async function uploadItem(item: UploadItem) {
    patchItem(item.key, { status: "uploading" });
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: item.file.name,
          contentType: item.file.type || "application/octet-stream",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.uploadUrl || !data?.uploadPreset) {
        throw new Error(data.error ?? "Upload failed");
      }

      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("upload_preset", data.uploadPreset);
      fd.append("folder", data.uploadFolder ?? "letters");

      const up = await fetch(data.uploadUrl, { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok || !upData?.secure_url) {
        throw new Error(upData?.error?.message ?? "Upload failed");
      }
      patchItem(item.key, { url: upData.secure_url, status: "done" });
    } catch {
      patchItem(item.key, { status: "error" });
    }
  }

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || /\.gif$/i.test(f.name)
    );
    setItems((prev) => {
      const room = MAX_MEDIA_PER_LETTER - prev.length;
      const next = list.slice(0, room).map((file) => ({
        key: nextKey(),
        file,
        url: null,
        status: "uploading" as const,
      }));
      const combined = [...prev, ...next];
      next.forEach((item) => {
        uploadItem(item);
      });
      return combined;
    });
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  return (
    <>
      {state.success ? (
        <JarConfirmation />
      ) : (
        <form action={formAction} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-heading">Your letter</span>
            <textarea
              name="bodyText"
              required
              rows={6}
              maxLength={50_000}
              placeholder="What would you like to say?"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-heading">
              Photos or GIFs{" "}
              <span className="font-normal text-muted">
                (optional · {items.length}/{MAX_MEDIA_PER_LETTER})
              </span>
            </span>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "mt-1 flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-surface px-3 py-4 text-center",
                items.length >= MAX_MEDIA_PER_LETTER && "opacity-50"
              )}
            >
              <span className="text-sm text-muted">
                {items.length >= MAX_MEDIA_PER_LETTER
                  ? `Upload limit reached (${MAX_MEDIA_PER_LETTER}).`
                  : "Choose or drop images or gifs here"}
              </span>
              <input
                type="file"
                accept="image/*,.gif"
                multiple
                disabled={items.length >= MAX_MEDIA_PER_LETTER}
                onChange={handlePick}
                className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-line/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-heading hover:file:bg-line/30 disabled:opacity-50"
              />
            </label>

            {items.length > 0 && (
              <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="relative aspect-square overflow-hidden rounded-lg border border-brass/40"
                  >
                    {item.status === "uploading" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-parchment">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-seal" />
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-parchment px-1 text-center">
                        <span className="text-[10px] font-medium text-heading">
                          Upload failed
                        </span>
                        <button
                          type="button"
                          onClick={() => uploadItem(item)}
                          className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-heading hover:border-brass"
                        >
                          Retry
                        </button>
                      </span>
                    )}
                    {item.status === "done" && item.url && (
                      <Image
                        src={item.url}
                        alt="Uploaded attachment"
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    {item.status !== "uploading" && (
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => removeItem(item.key)}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs text-parchment hover:bg-ink"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="hidden"
              name="mediaUrls"
              value={JSON.stringify(doneUrls)}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-heading">
              How should you appear?
            </legend>
            <div className="mt-2 flex gap-2">
              <label
                className={cn(
                  "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm",
                  displayMode === "signed"
                    ? "border-accent bg-accent/5 text-heading"
                    : "border-line bg-surface text-body"
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
                    ? "border-accent bg-accent/5 text-heading"
                    : "border-line bg-surface text-body"
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
              <span className="text-sm font-medium text-heading">Your name</span>
              <input
                name="contributorDisplayName"
                required
                placeholder="e.g. Maya"
                className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-heading">Your email</span>
            <input
              name="contributorEmail"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-muted">
              Used only for moderation traceability and to let you know if this jar
              is later made public. Never shown to the creator.
            </p>
          </label>

          {state.error && <p className="text-sm font-medium text-heading">{state.error}</p>}

          <button
            type="submit"
            disabled={pending || uploading}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Sending…" : uploading ? "Uploading…" : "Add to jar"}
          </button>
        </form>
      )}
    </>
  );
}