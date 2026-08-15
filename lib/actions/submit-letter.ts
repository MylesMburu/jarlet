"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MAX_MEDIA_PER_LETTER } from "@/lib/storage";

export type SubmitLetterState = {
  error?: string;
  success?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/;

export async function submitLetter(
  inviteToken: string,
  _prev: SubmitLetterState,
  formData: FormData
): Promise<SubmitLetterState> {
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const contributorEmail = String(formData.get("contributorEmail") ?? "").trim();
  const contributorDisplayName = String(
    formData.get("contributorDisplayName") ?? ""
  ).trim();
  const displayMode = String(formData.get("displayMode") ?? "signed");

  let mediaUrls: string[] = [];
  const rawMedia = String(formData.get("mediaUrls") ?? "").trim();
  if (rawMedia) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawMedia);
    } catch {
      return { error: "Invalid attachment data." };
    }
    if (!Array.isArray(parsed)) {
      return { error: "Invalid attachment data." };
    }
    mediaUrls = parsed
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (mediaUrls.length > MAX_MEDIA_PER_LETTER) {
      return { error: `You can attach at most ${MAX_MEDIA_PER_LETTER} images or gifs.` };
    }
    if (mediaUrls.some((u) => !URL_RE.test(u))) {
      return { error: "Invalid attachment URL." };
    }
  }

  if (!bodyText) {
    return { error: "Please write a letter before sending." };
  }
  if (bodyText.length > 50_000) {
    return { error: "That letter is too long (50,000 character limit)." };
  }
  if (!EMAIL_RE.test(contributorEmail)) {
    return { error: "Please enter a valid email address." };
  }
  if (displayMode !== "signed" && displayMode !== "anonymous") {
    return { error: "Invalid display mode." };
  }
  if (displayMode === "signed" && !contributorDisplayName) {
    return { error: "Please enter the name to display with your letter." };
  }

  const jar = await prisma.jar.findUnique({
    where: { inviteToken },
    select: { id: true, status: true },
  });

  if (!jar) {
    return { error: "This invite link is not valid." };
  }
  if (jar.status !== "open") {
    return { error: "This jar is closed and no longer accepts letters." };
  }

  await prisma.letter.create({
    data: {
      jarId: jar.id,
      contributorEmail,
      contributorDisplayName:
        displayMode === "signed" ? contributorDisplayName : null,
      displayMode,
      bodyText,
      media: {
        create: mediaUrls.map((url, order) => ({ url, order })),
      },
    },
  });

  revalidatePath(`/jar/${inviteToken}`);
  return { success: true };
}
