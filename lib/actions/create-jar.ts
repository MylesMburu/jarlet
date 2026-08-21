"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  draftJarFromFormData,
  isSealMode,
  type DraftJar,
} from "@/lib/draft-jar";

export type CreateJarState = {
  error?: string;
  jarId?: string;
};

export async function createJarFromDraft(
  draft: DraftJar
): Promise<CreateJarState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const title = draft.title.trim();
  const recipientName = draft.recipientName.trim();
  const prompt = draft.prompt.trim() || null;
  const sealMode = draft.sealMode;

  if (!title || !recipientName) {
    return { error: "Title and recipient name are required." };
  }

  if (!isSealMode(sealMode)) {
    return { error: "Choose a seal mode." };
  }

  let sealDate: Date | null = null;
  let sealLetterCount: number | null = null;

  if (sealMode === "date") {
    if (!draft.sealDate) return { error: "Choose a seal date." };
    sealDate = new Date(draft.sealDate);
    if (Number.isNaN(sealDate.getTime())) {
      return { error: "Choose a valid seal date." };
    }
  } else if (sealMode === "count") {
    const raw = Number(draft.sealLetterCount);
    if (!Number.isInteger(raw) || raw < 1) {
      return { error: "Seal letter count must be a positive number." };
    }
    sealLetterCount = raw;
  }

  const jar = await prisma.jar.create({
    data: {
      creatorId: session.user.id,
      title,
      recipientName,
      prompt,
      sealMode,
      sealDate,
      sealLetterCount,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  return { jarId: jar.id };
}

export async function createJar(
  _prev: CreateJarState,
  formData: FormData
): Promise<CreateJarState> {
  return createJarFromDraft(draftJarFromFormData(formData));
}
