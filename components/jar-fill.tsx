import { useId } from "react";
import { cn } from "@/lib/utils";

export function JarFill({
  letterCount,
  capacity = 20,
  className,
}: {
  letterCount: number;
  capacity?: number;
  className?: string;
}) {
  const clipId = useId().replace(/[:]/g, "");
  const cap = Math.max(capacity, 1);
  const ratio = Math.min(Math.max(letterCount, 0) / cap, 1);
  const surfaceY = 115 - 73 * ratio;

  return (
    <svg
      viewBox="0 0 120 150"
      aria-hidden
      className={cn("h-24 w-20", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M47 42 L73 42 L77 112 Q77 115 74 115 L46 115 Q43 115 43 112 Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect
          x="43"
          y={surfaceY}
          width="34"
          height={115 - surfaceY}
          fill="var(--color-brass)"
          opacity="0.3"
        />
        <rect
          x="43"
          y={surfaceY}
          width="34"
          height="3"
          fill="var(--color-brass)"
          opacity="0.6"
        />
      </g>

      <g
        fill="none"
        stroke="var(--color-brass)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="46"
          y="12"
          width="28"
          height="7"
          rx="2"
          fill="var(--surface)"
          strokeWidth="4"
        />
        <path d="M52 22 h16" />
        <path d="M52 25 L46 33 Q45 34.5 45 37 L45 114 Q45 118 49 118 L71 118 Q75 118 75 114 L75 37 Q75 34.5 74 33 L68 25" />
      </g>
    </svg>
  );
}