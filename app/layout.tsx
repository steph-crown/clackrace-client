import type { Metadata } from "next";
import {
  Chakra_Petch,
  Faster_One,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const fasterOne = Faster_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-faster-one",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClackRace — Type fast. Drive faster.",
  description:
    "Real-time multiplayer typing races. Jump in against CPU, friends, or anyone with a link — no account required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fasterOne.variable} ${chakraPetch.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
