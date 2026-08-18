import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Fraunces, Karla, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-fraunces",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-karla",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Jarlet",
  description:
    "Collect private letters from friends, seal them, and deliver a jar only one person can read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="sealed"
      className={`${fraunces.variable} ${karla.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}