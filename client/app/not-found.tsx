"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingProvider";

export default function NotFound() {
  const { brandName } = useBranding();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary to-brand-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Ghost className="opacity-0 h-24 w-24 text-primary animate-bounce " />
            <div className=" inset-0 flex items-center justify-center">
              <span className="text-9xl font-bold tracking-tighter text-foreground/5 selection:bg-primary">
                404
              </span>
            </div>
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Out of <span className="text-primary italic">Bounds</span>
        </h1>

        <p className="mt-6 text-lg leading-7 text-muted-foreground max-w-lg mx-auto">
          Oops! It looks like this court doesn&apos;t exist. The page
          you&apos;re searching for might have been retired or moved to a
          different club.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-primary/20 transition-all gap-2"
          >
            <Link href="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="rounded-full px-8 py-6 text-lg gap-2"
          >
            <Link href="/bookings">
              <ArrowLeft className="w-5 h-5" />
              Check Schedule
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-brand-300 to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-288.75"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <footer className="absolute bottom-8 text-sm text-muted-foreground font-medium">
        &copy; {new Date().getFullYear()} {brandName || "PadelBooking"}. All
        rights reserved.
      </footer>
    </div>
  );
}
