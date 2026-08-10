"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LetterTile, type LetterView } from "./letter-card";

export function LetterViewer({ letters }: { letters: LetterView[] }) {
  const [openLetter, setOpenLetter] = useState<LetterView | null>(null);

  useEffect(() => {
    if (!openLetter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLetter(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openLetter]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {letters.map((letter) => (
          <li key={letter.id}>
            <LetterTile
              letter={letter}
              active={openLetter?.id === letter.id}
              onOpen={() => setOpenLetter(letter)}
            />
          </li>
        ))}
      </ul>

      {openLetter && (
        <LetterModal letter={openLetter} onClose={() => setOpenLetter(null)} />
      )}
    </>
  );
}

function LetterModal({
  letter,
  onClose,
}: {
  letter: LetterView;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    closeRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, []);

  const isAnonymous =
    letter.displayMode === "anonymous" || !letter.contributorDisplayName;
  const author = isAnonymous ? "Anonymous" : letter.contributorDisplayName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-twilight/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Letter"
        data-open={revealed}
        className="env-modal envelope relative w-full max-w-lg overflow-hidden rounded-2xl border border-brass bg-surface shadow-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-30 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-heading focus-visible:outline-2 focus-visible:outline-current"
        >
          Close
        </button>

        <div className="env-body max-h-[55vh] overflow-y-auto px-6 pt-6">
          <p className="whitespace-pre-wrap text-body">{letter.bodyText}</p>
          {letter.mediaUrl && (
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-line/15">
              <Image
                src={letter.mediaUrl}
                alt="Letter attachment"
                fill
                sizes="(max-width: 768px) 90vw, 448px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="env-signature flex items-end justify-between gap-3 px-6 pb-6 pt-4">
          {isAnonymous ? (
            <span className="text-sm font-medium text-body">Anonymous</span>
          ) : (
            <span className="font-signature text-2xl leading-snug text-heading">
              {author}
            </span>
          )}
          <time className="text-xs text-muted">
            {letter.createdAt.toLocaleDateString()}
          </time>
        </div>

        <span aria-hidden className="env-pocket absolute inset-x-0 bottom-0 h-1/2 bg-surface" />
        <span aria-hidden className="env-flap absolute inset-x-0 top-0 h-1/2 border-b border-line bg-surface">
          <span className="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-heading/50" />
        </span>
      </div>
    </div>
  );
}