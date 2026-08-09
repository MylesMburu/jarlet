import Image from "next/image";

export type LetterView = {
  id: string;
  contributorDisplayName: string | null;
  displayMode: string;
  bodyText: string;
  mediaUrl: string | null;
  createdAt: Date;
};

export function LetterCard({ letter }: { letter: LetterView }) {
  const isAnonymous =
    letter.displayMode === "anonymous" || !letter.contributorDisplayName;
  const author = isAnonymous ? "Anonymous" : letter.contributorDisplayName;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="font-medium text-zinc-800">{author}</p>
        <time className="text-xs text-zinc-400">
          {letter.createdAt.toLocaleDateString()}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-zinc-700">{letter.bodyText}</p>
      {letter.mediaUrl && (
        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={letter.mediaUrl}
            alt="Letter attachment"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </article>
  );
}