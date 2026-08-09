import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

/**
 * Stub notification when a jar goes public. In dev it prints each email to
 * the console via the jsonTransport mailer. Wire the real email provider
 * (Resend/Postmark) later — this function's contract stays the same.
 */
export async function notifyContributorsJarPublic(jarId: string) {
  const contributors = await prisma.letter.findMany({
    where: { jarId },
    select: { contributorEmail: true },
    distinct: ["contributorEmail"],
  });

  for (const { contributorEmail } of contributors) {
    await sendEmail({
      to: contributorEmail,
      subject: "A jar you wrote into is now public",
      text: "The letter jar you contributed to has been made public. You can see it at the public link.",
      html: "<p>The letter jar you contributed to has been made public.</p>",
    });
  }

  return contributors.length;
}