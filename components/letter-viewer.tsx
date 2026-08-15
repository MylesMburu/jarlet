"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LetterTile, type LetterView } from "./letter-card";

export function LetterViewer({ letters }: { letters: LetterView[] }) {
  const [openLetter, setOpenLetter] = useState<LetterView | null>(null);

  useEffect(() => {
    if (!openLetter) return;
    document.body.style.overflow = "hidden";
    return () => {
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

function cloudinaryThumb(url: string): string {
  return url.includes("/image/upload/")
    ? url.replace("/image/upload/", "/image/upload/w_200,h_200,c_fill/")
    : url;
}

function LetterModal({
  letter,
  onClose,
}: {
  letter: LetterView;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const media = [...letter.media].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    closeRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, onClose]);

  const isAnonymous =
    letter.displayMode === "anonymous" || !letter.contributorDisplayName;
  const author = isAnonymous ? "Anonymous" : letter.contributorDisplayName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-twilight/50 transition-opacity duration-300"
        style={{ opacity: revealed ? 1 : 0 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Letter"
        className={`relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-brass bg-surface shadow-xl transition-all duration-300 ease-out motion-reduce:transition-none ${
          revealed ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        {/* header row — close button gets its own space, never overlaps text */}
        <div className="flex items-center justify-between border-b border-brass/25 px-6 py-3">
          <Image src='/jarlet-icon.svg' alt="Jarlet Logo" width={50} height={50}/>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-brass/40 px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-brass hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
          >
            Close
          </button>
        </div>

        {/* body */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-body">
            {letter.bodyText}
          </p>

          {media.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLightbox(m.url)}
                  aria-label="Enlarge attachment"
                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-brass bg-parchment transition-transform hover:scale-105"
                >
                  <Image
                    src={cloudinaryThumb(m.url)}
                    alt="Letter attachment"
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* signature footer */}
        <div className="flex items-end justify-between gap-3 border-t border-brass/25 bg-parchment/40 px-6 py-4">
          {isAnonymous ? (
            <span className="font-body text-sm font-medium text-body">Anonymous</span>
          ) : (
            <span className="font-signature text-2xl leading-snug text-seal">
              {author}
            </span>
          )}
          <time className="font-body text-xs text-muted">
            {letter.createdAt.toLocaleDateString()}
          </time>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <button
            aria-label="Close image"
            onClick={() => setLightbox(null)}
            className="absolute inset-0 bg-ink/80"
          />
          <div className="relative max-h-[85vh] max-w-[90vw]">
            <Image
              src={lightbox}
              alt="Letter attachment"
              width={1200}
              height={900}
              sizes="90vw"
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-brass bg-surface text-sm text-heading shadow hover:bg-parchment"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}