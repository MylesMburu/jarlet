import { cn } from "@/lib/utils";

export function JarDrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      aria-hidden
      className={cn("h-24 w-20", className)}
    >
      <g className="jar-letter">
        <rect
          x="53"
          y="-22"
          width="14"
          height="18"
          rx="1.5"
          fill="var(--surface)"
          stroke="var(--color-brass)"
          strokeWidth="3"
        />
        <line
          x1="53"
          y1="-15"
          x2="67"
          y2="-15"
          stroke="var(--color-brass)"
          strokeWidth="2"
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