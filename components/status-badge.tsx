import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    sealed: "bg-amber-50 text-amber-700 border-amber-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"
      )}
    >
      {status}
    </span>
  );
}
