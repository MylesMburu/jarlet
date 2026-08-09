"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notifyContributorsJarPublic } from "@/lib/notifications";

export type PublicJarActionState = {
  error?: string;
};

function randomSlug(): string {
  return (
    crypto.randomUUID().replaceAll("-", "") +
    crypto.randomUUID().replaceAll("-", "")
  );
}

export async function setJarPublic(
  recipientToken: string
): Promise<PublicJarActionState> {
  const jar = await prisma.jar.findUnique({
    where: { recipientToken },
    select: { id: true, status: true, isPublic: true, publicSlug: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status !== "delivered") {
    return { error: "This jar hasn't been delivered yet." };
  }

  await prisma.jar.update({
    where: { id: jar.id },
    data: { isPublic: true, publicSlug: jar.publicSlug ?? randomSlug() },
  });

  revalidatePath(`/j/${recipientToken}`);
  revalidatePath(`/p/${jar.publicSlug ?? ""}`);

  await notifyContributorsJarPublic(jar.id);

  return {};
}

export async function setJarPrivate(
  recipientToken: string
): Promise<PublicJarActionState> {
  const jar = await prisma.jar.findUnique({
    where: { recipientToken },
    select: { id: true, isPublic: true },
  });
  if (!jar) return { error: "Jar not found." };

  await prisma.jar.update({
    where: { id: jar.id },
    data: { isPublic: false },
  });

  revalidatePath(`/j/${recipientToken}`);
  return {};
}