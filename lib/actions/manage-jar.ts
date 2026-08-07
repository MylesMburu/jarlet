"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type JarActionResult = {
  error?: string;
};

export async function sealJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status !== "open") return { error: "This jar is already sealed." };

  await prisma.jar.update({
    where: { id: jar.id },
    data: { status: "sealed" },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  return {};
}

export async function sendJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status === "open") return { error: "Seal the jar before sending." };

  const recipientToken =
    crypto.randomUUID().replaceAll("-", "") +
    crypto.randomUUID().replaceAll("-", "");

  await prisma.jar.update({
    where: { id: jar.id },
    data: { status: "delivered", recipientToken },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  return {};
}