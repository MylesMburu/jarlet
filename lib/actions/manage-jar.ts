"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type JarActionResult = {
  error?: string;
};

export type SealMode = "manual" | "date" | "count";

export type UpdateJarState = {
  error?: string;
  success?: boolean;
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

export async function updateJar(
  jarId: string,
  _prev: UpdateJarState,
  formData: FormData
): Promise<UpdateJarState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status !== "open") {
    return {
      error:
        jar.status === "sealed"
          ? "This jar is sealed and locked. Reopen it to edit details."
          : "This jar is delivered and locked from the creator's side.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim() || null;
  const sealMode = String(formData.get("sealMode") ?? "manual") as SealMode;

  if (!title || !recipientName) {
    return { error: "Title and recipient name are required." };
  }
  if (sealMode !== "manual" && sealMode !== "date" && sealMode !== "count") {
    return { error: "Invalid seal mode." };
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

  await prisma.jar.update({
    where: { id: jar.id },
    data: { title, recipientName, prompt, sealMode, sealDate, sealLetterCount },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reopenJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status !== "sealed") {
    return { error: "Only a sealed jar can be reopened." };
  }

  await prisma.jar.update({
    where: { id: jar.id },
    data: { status: "open" },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  revalidatePath("/dashboard");
  return {};
}

export async function archiveJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true, archivedAt: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status === "open") {
    return { error: "An open jar can be deleted instead of archived." };
  }
  if (jar.archivedAt) return { error: "This jar is already archived." };

  await prisma.jar.update({
    where: { id: jar.id },
    data: { archivedAt: new Date() },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  revalidatePath("/dashboard");
  return {};
}

export async function unarchiveJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true },
  });
  if (!jar) return { error: "Jar not found." };

  await prisma.jar.update({
    where: { id: jar.id },
    data: { archivedAt: null },
  });

  revalidatePath(`/jar/${jarId}/manage`);
  revalidatePath("/dashboard");
  return {};
}

export async function deleteJar(jarId: string): Promise<JarActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const jar = await prisma.jar.findFirst({
    where: { id: jarId, creatorId: session.user.id },
    select: { id: true, status: true },
  });
  if (!jar) return { error: "Jar not found." };
  if (jar.status !== "open") {
    return {
      error:
        "Only an open jar can be deleted. Sealed and delivered jars can be archived instead.",
    };
  }

  await prisma.jar.delete({ where: { id: jar.id } });

  revalidatePath("/dashboard");
  revalidatePath(`/jar/${jarId}/manage`);
  redirect("/dashboard");
}