"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const STATIC_COACHES = [
    {
        id: 1,
        name: "Carlos Mendez",
        title: "Head Strategy Coach",
        image: "/images/padel-coach-2.png",
        bio: "Specializing in advanced match tactics and professional stroke refinement."
    },
    {
        id: 2,
        name: "Sofia Rodriguez",
        title: "Performance Instructor",
        image: "/images/padel-coach-2.png",
        bio: "Expert in player conditioning and technical mastery for competitive levels."
    },
    {
        id: 3,
        name: "Ahmed Hassan",
        title: "Development Specialist",
        image: "/images/padel-coach-2.png",
        bio: "Focused on building strong foundations for rising talents in the academy."
    }
];

export function AcademySection() {
    const router = useRouter();

    return (
        <section className="py-24 bg-background overflow-hidden">
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
                    {STATIC_COACHES.map((coach) => (
                        <div key={coach.id} className="group relative bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="aspect-[4/5] relative">
                                <Image
                                    src={coach.image}
                                    alt={coach.name}
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
                                        {coach.title}
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
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-[2rem] bg-muted/30 border border-border flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Daily Training Sessions</p>
                            <p className="text-sm text-muted-foreground text-balance">Moorning and evening slots available for all skill levels.</p>
                        </div>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => router.push('/academy')}
                        className="text-primary font-bold text-lg p-0"
                    >
                        Check Availability
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
