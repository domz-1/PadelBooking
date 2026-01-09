"use client";

import Image from "next/image";
import { useBranding } from "@/components/providers/BrandingProvider";
import {
    ShieldCheck,
    Trophy,
    Users,
    Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        name: 'Seamless Booking',
        description: 'Check real-time availability and book your preferred court in seconds with instant confirmation.',
        icon: Calendar,
    },
    {
        name: 'Professional Academy',
        description: 'Elite coaching programs and training packages tailored for players of all skill levels.',
        icon: Trophy,
    },
    {
        name: 'Premium Courts',
        description: 'International-standard courts across multiple branches, maintained for the ultimate game.',
        icon: ShieldCheck,
    },
    {
        name: 'Active Community',
        description: 'Connect with a vibrant network of players, join tournaments, and find match partners.',
        icon: Users,
    }
];

export function WhyChoose() {
    const { brandName } = useBranding();

    return (
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:items-center">
                    <div className="lg:col-span-1">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4"
                        >
                            The Advantage
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6 leading-tight"
                        >
                            Why Choose <span className="text-primary italic font-black pr-2">{brandName}</span>?
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground leading-relaxed mb-8 max-w-md"
                        >
                            We offer a seamless, premium experience for every padel enthusiast, from the first click to the final score.
                        </motion.p>

                        {/* <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50"
                        >
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-muted">
                                        <Image
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                                            alt="User"
                                            width={32}
                                            height={32}
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs font-semibold">
                                <span className="text-primary">1,000+</span> active players
                            </div>
                        </motion.div> */}
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="group p-6 rounded-2xl bg-card hover:bg-muted/30 border border-border/50 transition-all duration-300"
                            >
                                <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-2">{feature.name}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
