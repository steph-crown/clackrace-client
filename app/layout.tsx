import type { Metadata } from "next";
import {
  Chakra_Petch,
  JetBrains_Mono,
  Racing_Sans_One,
  Space_Grotesk,
  Faster_One,
} from "next/font/google";
import "./globals.css";

const racingSans = Racing_Sans_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-racing-sans",
  display: "swap",
});

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
      className={`${racingSans.variable} ${chakraPetch.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${fasterOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
