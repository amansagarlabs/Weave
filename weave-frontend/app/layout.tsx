import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weave - where good work finds its people",
  description: "A connector platform for creators, brands, and editors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
