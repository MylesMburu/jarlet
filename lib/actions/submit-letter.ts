"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SubmitLetterState = {
  error?: string;
  success?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim() || null;

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
      mediaUrl,
    },
  });

  revalidatePath(`/jar/${inviteToken}`);
  return { success: true };
}
