import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";

export const metadata: Metadata = {
  title: "Weave - where good work finds its people",
  description: "A connector platform for creators, brands, and editors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="weave-theme-bootstrap" strategy="beforeInteractive">{`
          try {
            const theme = window.localStorage.getItem('weave_theme');
            const next = theme === 'dark' ? 'dark' : 'light';
            document.documentElement.dataset.theme = next;
          } catch (error) {}
        `}</Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
