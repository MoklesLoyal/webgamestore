import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StackAuthProvider from "@/components/providers/stack-auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebGameStore - Gestion de Tokens de Transcription",
  description: "Plateforme de gestion de tokens de transcription pour livestreams et vidéos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackAuthProvider>
          {children}
        </StackAuthProvider>
      </body>
    </html>
  );
}

