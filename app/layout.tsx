import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "MazeGen — Procedural Maze Generator",
  description:
    "Explore procedurally generated mazes using DFS and Prim's algorithm. Navigate with keyboard or touch. Can you find the exit?",
  keywords: ["maze", "maze generator", "procedural", "DFS", "Prim", "game", "puzzle"],
  authors: [{ name: "MazeGen" }],
  robots: "index, follow",
  openGraph: {
    title: "MazeGen — Procedural Maze Generator",
    description: "Explore infinite procedurally generated mazes. Navigate with keyboard or touch.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-maze-bg`}>{children}</body>
    </html>
  );
}
