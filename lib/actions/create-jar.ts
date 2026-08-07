"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SealMode = "manual" | "date" | "count";

export type CreateJarState = {
  error?: string;
  jarId?: string;
};

export async function createJar(
  _prev: CreateJarState,
  formData: FormData
): Promise<CreateJarState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim() || null;
  const sealMode = String(formData.get("sealMode") ?? "manual") as SealMode;

  if (!title || !recipientName) {
    return { error: "Title and recipient name are required." };
  }

  let sealDate: Date | null = null;
  let sealLetterCount: number | null = null;

  if (sealMode === "date") {
    const raw = String(formData.get("sealDate") ?? "");
    if (!raw) return { error: "Choose a seal date." };
    sealDate = new Date(raw);
  } else if (sealMode === "count") {
    const raw = Number(formData.get("sealLetterCount"));
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