import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BrandingProvider } from "@/components/providers/BrandingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PadelBooking",
  description: "Book your padel court easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BrandingProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
