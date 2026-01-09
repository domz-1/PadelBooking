import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BrandingProvider } from "@/components/providers/BrandingProvider";
import { Toaster } from "@/components/ui/sonner";

import { API_BASE_URL } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/config`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) throw new Error("Failed to fetch config");

    const { data: config } = await res.json();
    const brandName = config?.businessName || "PadelBooking";
    const logoUrl = config?.logo;

    return {
      title: {
        default: brandName,
        template: `%s | ${brandName}`,
      },
      description: "Book your padel court easily",
      icons: logoUrl ? {
        icon: [
          { url: logoUrl, sizes: "any" },
          { url: logoUrl, type: "image/webp" },
        ],
        apple: [
          { url: logoUrl },
        ],
      } : {
        icon: "/favicon.ico",
      },
      openGraph: {
        title: brandName,
        description: "Book your padel court easily",
        images: logoUrl ? [{ url: logoUrl }] : [],
      }
    };
  } catch (_error) {
    return {
      title: "PadelBooking",
      description: "Book your padel court easily",
      icons: {
        icon: "/favicon.ico",
      }
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BrandingProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
