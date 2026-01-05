import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Sponsor {
  id: number;
  name: string;
  image: string;
  link: string;
  isActive: boolean;
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await api.get("/sponsors");
        if (response.data.success) {
          setSponsors(response.data.data.filter((sponsor: Sponsor) => sponsor.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch sponsors:", error);
        // Fallback to sample sponsors
        setSponsors([
          { id: 1, name: "Sample Sponsor", image: "/placeholder.svg", link: "#", isActive: true },
          { id: 2, name: "Sample Sponsor 2", image: "/placeholder.svg", link: "#", isActive: true },
        ]);
      }
    };

    fetchSponsors();
  }, []);

  useEffect(() => {
    if (sponsors.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors.length]);

  if (sponsors.length === 0) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-4`}>
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-8">
          {sponsors.map((sponsor, index) => (
            <div 
              key={sponsor.id} 
              className={`flex-shrink-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
              }`}
              style={{ display: index === currentIndex ? 'block' : 'none' }}
            >
              <a 
                href={sponsor.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <img 
                  src={sponsor.image} 
                  alt={sponsor.name} 
                  className="h-16 object-contain rounded-lg"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sponsors.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex 
                ? theme === 'dark' 
                  ? 'bg-white' 
                  : 'bg-gray-900' 
                : theme === 'dark' 
                  ? 'bg-gray-600' 
                  : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to sponsor ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}