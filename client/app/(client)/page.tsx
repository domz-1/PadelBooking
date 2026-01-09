"use client";

import { LandingHero } from "@/components/landing/LandingHero";
import { SponsorCarousel } from "@/components/wrapper/ClientPage";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { AcademySection } from "@/components/landing/AcademySection";

import { WhyChoose } from "@/components/landing/WhyChoose";
import { ConnectSection } from "@/components/landing/ConnectSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow">
        <LandingHero />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <SponsorCarousel />
        </div>

        <FeaturedProducts />
        <AcademySection />
        <WhyChoose />
        <ConnectSection />
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-brand-600">
            PadelBooking
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 PadelBooking. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
