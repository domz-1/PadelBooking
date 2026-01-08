import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTheme } from "@/components/providers/ThemeProvider";
import Image from "next/image";

interface Sponsor {
  id: number;
  name: string;
  image: string;
  link: string;
  isActive: boolean;
  showInHome: boolean;
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await api.get("/sponsors");
        if (response.data.success) {
          setSponsors(response.data.data.filter((sponsor: Sponsor) => sponsor.isActive && sponsor.showInHome !== false));
        }
      } catch (error) {
        console.error("Failed to fetch sponsors:", error);
        // Fallback to sample sponsors
        setSponsors([
          { id: 1, name: "Sample Sponsor", image: "/placeholder.svg", link: "#", isActive: true, showInHome: true },
          { id: 2, name: "Sample Sponsor 2", image: "/placeholder.svg", link: "#", isActive: true, showInHome: true },
        ]);
      }
    };

    fetchSponsors();
  }, []);

  if (sponsors.length === 0) return null;

  // Duplicate sponsors multiple times for seamless marquee effect even on large screens
  const marqueeSponsors = Array(10).fill(sponsors).flat();

  return (
    <div className={`relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100/50'} py-2`}>
      <div className="flex w-fit animate-marquee">
        {marqueeSponsors.map((sponsor, index) => (
          <div
            key={`${sponsor.id}-${index}`}
            className="flex-shrink-0 px-4"
          >
            <a
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-40 h-24"
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg border border-border bg-card">
                <Image
                  src={sponsor.image}
                  alt={sponsor.name}
                  fill
                  unoptimized
                  className="object-contain bg-transparent"
                />
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}