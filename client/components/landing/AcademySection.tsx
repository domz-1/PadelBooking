"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Coach {
    id: number;
    name: string;
    image: string | null;
    bio: string;
    rating: number;
    specialties: string[];
}

export function AcademySection() {
    const router = useRouter();
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const { data } = await api.get('/coaches');
                if (data.success && Array.isArray(data.data)) {
                    setCoaches(data.data.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch coaches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, []);

    const displayCoaches = coaches.length > 0 ? coaches : [];

    return (
        <section className="py-24 bg-background overflow-hidden h-fit">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            <Trophy className="w-3 h-3" />
                            Padel Academy
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Elevate Your <span className="text-primary italic">Game</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Learn from the best. Our world-class instructors are here to help you master every stroke, strategy, and mental aspect of Padel.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => router.push('/academy')}
                        className="rounded-full border-primary/20 hover:border-primary transition-all group"
                    >
                        Explore Academy
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        // Simple loading skeletons
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="aspect-4/5 bg-muted animate-pulse rounded-3xl" />
                        ))
                    ) : (
                        displayCoaches.map((coach) => (
                            <div key={coach.id} className="group relative bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="relative aspect-4/5">
                                    <Image
                                        src={coach.image || "/images/padel-coach-2.png"}
                                        alt={coach.name || "Coach"}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <div className="flex items-center gap-1 mb-3">
                                            <Star className="w-4 h-4 fill-primary text-primary" />
                                            <span className="text-xs font-black uppercase tracking-widest">Expert Level</span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-1">{coach.name}</h3>
                                        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                                            {coach.specialties?.[0] || "Professional Coach"}
                                        </p>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                            {coach.bio}
                                        </p>
                                        <Button
                                            onClick={() => router.push('/academy')}
                                            className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                                        >
                                            View Programs
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
