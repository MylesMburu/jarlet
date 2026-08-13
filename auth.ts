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
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "unset",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "unset",
      allowDangerousEmailAccountLinking: true,
    }),
    Email({
      server:
        process.env.SMTP_HOST
          ? {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT ?? 587),
              secure: process.env.SMTP_SECURE === "true",
              ...(process.env.SMTP_USER && process.env.SMTP_PASS
                ? {
                    auth: {
                      user: process.env.SMTP_USER,
                      pass: process.env.SMTP_PASS,
                    },
                  }
                : {}),
            }
          : {
              jsonTransport: true,
            },
      from: process.env.EMAIL_FROM ?? "Letter Jar <no-reply@letterjar.local>",
      sendVerificationRequest({ identifier, url }) {
        return sendEmail({
          to: identifier,
          subject: `Sign in to Letter Jar`,
          text: `Sign in to Letter Jar with this link:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
          html: `<p>Sign in to Letter Jar with this link:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
        }).catch((error) => {
          console.error("[auth][email] Failed to send verification email", error);
        });
      },
    }),
  ],
});
