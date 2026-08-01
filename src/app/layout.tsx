import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "AirBridge is a peer-to-peer file transfer prototype: two devices connect with a room code and send one file directly over WebRTC, with no permanent upload to a server.";

export const metadata: Metadata = {
  title: "AirBridge — Peer-to-peer file transfer",
  description,
  openGraph: {
    title: "AirBridge — Peer-to-peer file transfer",
    description,
    type: "website",
    siteName: "AirBridge",
  },
  twitter: {
    card: "summary",
    title: "AirBridge — Peer-to-peer file transfer",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
