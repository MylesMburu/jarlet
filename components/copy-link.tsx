"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
        {url}
      </code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={cn(
          "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
          copied
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
