import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "unset",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "unset",
      allowDangerousEmailAccountLinking: true,
    }),
    Email({
      server: {
        host: process.env.SMTP_HOST ?? "localhost",
        port: Number(process.env.SMTP_PORT ?? 1025),
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
      },
      from: process.env.EMAIL_FROM ?? "Letter Jar <no-reply@letterjar.local>",
      sendVerificationRequest({ identifier, url }) {
        void sendEmail({
          to: identifier,
          subject: `Sign in to Letter Jar`,
          text: `Sign in to Letter Jar with this link:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
          html: `<p>Sign in to Letter Jar with this link:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
        });
      },
    }),
  ],
});
