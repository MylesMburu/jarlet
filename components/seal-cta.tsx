import { cn } from "@/lib/utils";

export function SealCta({ className }: { className?: string }) {
  return (
    <a
      href="/auth/signin"
      className={cn(
        "rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90",
        className
      )}
    >
      Create a jar
    </a>
  );
}