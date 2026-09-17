import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { CafeBackdrop, ThemeProvider } from "@/components/theme";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lunorsoft — Study Café",
  description:
    "A calm digital study café where students organise tasks, focus, and take gentle breaks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} cafe-grain antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CafeBackdrop />
            <div className="relative z-10">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
