"use client";

export type LetterView = {
  id: string;
  contributorDisplayName: string | null;
  displayMode: string;
  bodyText: string;
  media: { id: string; url: string; order: number }[];
  createdAt: Date;
};

export function LetterTile({
  letter,
  active,
  onOpen,
}: {
  letter: LetterView;
  active?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      aria-haspopup="dialog"
      onClick={onOpen}
      className="envelope relative mx-auto block h-[104px] w-full max-w-[170px] overflow-hidden rounded-xl border border-brass bg-surface text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
    >
      <span className="sr-only">
        Open letter from {letter.contributorDisplayName ?? "Anonymous"}
      </span>
      <span aria-hidden className="env-pocket absolute inset-x-0 bottom-0 h-1/2 bg-surface" />
      <span aria-hidden className="env-flap absolute inset-x-0 top-0 h-1/2 border-b border-line bg-surface">
        <span className="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-heading/40" />
      </span>
    </button>
  );
}