import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "border-brass/70 bg-brass/10 text-ink",
    sealed: "border-ink/30 bg-ink/5 text-ink",
    delivered: "border-sage/40 bg-sage/10 text-sage",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "border-line bg-surface text-muted"
      )}
    >
      {status}
    </span>
  );
}
