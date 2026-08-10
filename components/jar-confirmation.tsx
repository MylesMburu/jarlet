export function JarConfirmation() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <svg viewBox="0 0 120 150" aria-hidden className="h-40 w-32">
        <defs>
          <clipPath id="jar-confirm-clip">
            <path d="M47 42 L73 42 L77 112 Q77 115 74 115 L46 115 Q43 115 43 112 Z" />
          </clipPath>
        </defs>

        <g clipPath="url(#jar-confirm-clip)">
          <g className="cjar-fill">
            <rect
              x="43"
              y="40"
              width="34"
              height="75"
              fill="var(--color-brass)"
              opacity="0.3"
            />
            <rect
              x="43"
              y="40"
              width="34"
              height="3"
              fill="var(--color-brass)"
              opacity="0.6"
            />
          </g>
        </g>

        <g className="cjar-letter">
          <rect
            x="52"
            y="-26"
            width="16"
            height="22"
            rx="1.5"
            fill="var(--surface)"
            stroke="var(--color-brass)"
            strokeWidth="3"
          />
          <line
            x1="52"
            y1="-18"
            x2="68"
            y2="-18"
            stroke="var(--color-brass)"
            strokeWidth="2"
          />
          <line
            x1="52"
            y1="-12"
            x2="68"
            y2="-12"
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

      <div>
        <p className="font-medium text-sage">Your letter is in the jar.</p>
        <p className="mt-1 text-sm text-muted">
          It stays sealed until the jar is sent.
        </p>
      </div>
    </div>
  );
}