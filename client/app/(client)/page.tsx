"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { LandingHero } from "@/components/landing/LandingHero";
import { SponsorCarousel } from "@/components/wrapper/ClientPage";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { AcademySection } from "@/components/landing/AcademySection";

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


        {/* Additional sections can go here: Features, Testimonials, etc. */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-12 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Why Choose PadelBooking?
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Our platform is designed specifically for Padel enthusiasts. We provide the tools you need to find, book, and enjoy your favorite sport without any hassle.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-muted-foreground lg:max-w-none">
                  {[
                    {
                      name: 'Real-time Availability',
                      description: 'See which courts are free instantly and book your slot in seconds.',
                    },
                    {
                      name: 'Padel Academy',
                      description: 'Learn from professional coaches with tailored training packages.',
                    },
                    {
                      name: 'Branch Management',
                      description: 'Easily switch between different locations and find the one closest to you.',
                    },
                  ].map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-foreground">
                        <div className="absolute left-1 top-1 h-5 w-5 text-primary">✓</div>
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative">
                <div className="aspect-4/3 rounded-2xl bg-primary/5 p-8 border border-primary/10 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-bold text-primary">1000+</div>
                    <div className="text-xl font-medium text-muted-foreground">Monthly Bookings</div>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                    <div className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Join our growing community of padel players and never miss a match.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
