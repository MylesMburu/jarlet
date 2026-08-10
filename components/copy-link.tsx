"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
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
            ? "border-sage/40 bg-sage/10 text-sage"
            : "border-input bg-surface text-body hover:border-heading"
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
