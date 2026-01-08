"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { coachService } from "@/lib/services/coach.service";
import { Coach, Package } from "@/lib/types";
import {
    CheckCircle2,
    MessageCircle,
    Loader2,
    GraduationCap,
    Clock,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useBranding } from "@/components/providers/BrandingProvider";

function AcademyContent() {
    const searchParams = useSearchParams();
    const selectedCoachId = searchParams.get("coach");
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    const { config } = useBranding();

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const res = await coachService.getAll();
                if (res.success) {
                    setCoaches(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch academy data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading Academy programs...</p>
            </div>
        );
    }

    const handleWhatsApp = (coachName: string, packageName?: string) => {
        const phone = config?.supportNumber1 || "01001234567";
        const text = encodeURIComponent(
            `Hi! I'm interested in ${packageName ? `the ${packageName} package` : "joining the Academy"} with ${coachName}. Could you provide more details?`
        );
        window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, "_blank");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
            {/* Hero Header */}
            <div className="text-center space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest">
                    <GraduationCap className="w-4 h-4" />
                    Professional Padel Academy
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                    Master the Art of <span className="text-primary italic">Padel</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Choose your mentor and accelerate your progress with our performance-driven training packages.
                </p>
            </div>

            {/* Coaches & Packages */}
            <div className="space-y-32">
                {coaches.map((coach) => (
                    <div
                        key={coach.id}
                        id={`coach-${coach.id}`}
                        className={`flex flex-col lg:flex-row gap-12 items-start ${selectedCoachId === coach.id.toString() ? 'ring-2 ring-primary ring-offset-8 rounded-3xl p-4' : ''}`}
                    >
                        {/* Coach Profile Card */}
                        <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
                            <div className="bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl">
                                <div className="aspect-square relative">
                                    <Image
                                        src={coach.User?.image || "/images/padel-coach-2.png"}
                                        alt={coach.User?.name || "Coach"}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                        <Badge className="bg-primary text-white border-none px-3 py-1 font-bold">
                                            HEAD COACH
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-black mb-2">{coach.User?.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {coach.experience || "Professional Experience"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {coach.bio || "Specialized in professional player development and tactical match play. International certification and proven track record."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Packages Grid */}
                        <div className="w-full lg:w-2/3 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-px grow bg-border/50" />
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    Available Packages
                                </h4>
                                <div className="h-px grow bg-border/50" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {coach.packages && coach.packages.length > 0 ? (
                                    coach.packages.map((pkg) => (
                                        <div key={pkg.id} className="group relative bg-card rounded-[1.5rem] p-8 border border-border/50 shadow-xl overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h5 className="text-xl font-bold mb-1">{pkg.name}</h5>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {pkg.description || "Comprehensive training program designed for consistency and skill improvement."}
                                                    </p>
                                                </div>

                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black">EGP {pkg.price.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                                                </div>

                                                <ul className="space-y-2 py-4">
                                                    {[
                                                        "Technical Stroke Analysis",
                                                        "Tactical Game Play",
                                                        "Professional Equipment Provided",
                                                        "Performance Tracking"
                                                    ].map((feat, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                                            {feat}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <Button
                                                    onClick={() => handleWhatsApp(coach.User?.name || "Coach", pkg.name)}
                                                    className="w-full rounded-xl font-bold bg-primary hover:bg-primary/80 text-white"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Book Package
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                                        <p className="font-bold text-muted-foreground">No Custom Packages Yet</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleWhatsApp(coach.User?.name || "Coach")}
                                            className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white"
                                        >
                                            Message Coach
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Why Academy Section */}
            <div className="bg-muted/30 rounded-[3rem] p-12 md:p-24 relative overflow-hidden border border-border/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold tracking-tight">Why Our Academy?</h2>
                        <div className="space-y-6">
                            {[
                                { title: "Personalized Development", desc: "Every session is tailored to your specific level and goals." },
                                { title: "Fast-Track Progress", desc: "Skip the trial and error with proven professional techniques." },
                                { title: "Match Integration", desc: "Apply what you learn in supervised match play sessions." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative aspect-[15/9] rounded-3xl overflow-hidden">
                        <Image
                            src="/images/product-padel.png"
                            alt="Training Equipment"
                            fill
                            className="object-cover transition-all duration-700"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AcademyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <AcademyContent />
        </Suspense>
    );
}
