import nodemailer from "nodemailer";

let transport: nodemailer.Transporter;

function getTransport(): nodemailer.Transporter {
  if (transport) return transport;

  if (process.env.SMTP_HOST) {
    transport = nodemailer.createTransport({
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
    });
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[mailer] SMTP_HOST is not set in production — emails are generated but NOT delivered."
      );
    }
    transport = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transport;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const info = await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? "Letter Jar <no-reply@letterjar.local>",
    ...options,
  });

  if (process.env.NODE_ENV !== "production" && info.message) {
    console.log(
      `[dev mail] to=${options.to} subject="${options.subject}"\n${info.message}`
    );
  }

  return info;
}
