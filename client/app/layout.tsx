
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


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
    <html lang="en">
      <body className={inter.className}>
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}
