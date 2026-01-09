"use client";

import { useBranding } from "@/components/providers/BrandingProvider";
import {
    Instagram,
    Facebook,
    Twitter,
    MessageCircle, // For WhatsApp
    Mail,
    Phone,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'WhatsApp', icon: MessageCircle, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' }
];

export function ConnectSection() {
    const { brandName, config } = useBranding();

    return (
        <section className="py-20 bg-muted/20 border-y border-border/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4"
                        >
                            Stay Connected
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mb-8 leading-relaxed max-w-md"
                        >
                            Follow <span className="text-primary font-semibold">{brandName}</span> for updates, matches, and exclusive community events.
                        </motion.p>

                        <div className="flex flex-wrap gap-4">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-card border border-border shadow-xs hover:border-primary/50 hover:text-primary transition-all duration-300"
                                    title={social.name}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden"
                    >
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-foreground">Direct Contact</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <a href={`tel:${config?.supportNumber1}`} className="group block">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Call Us</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {config?.supportNumber1 || "+123 456 7890"}
                                        </span>
                                        <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </a>

                                <a href="mailto:info@padelbooking.com" className="group block">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Email Us</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">info@padelbooking.com</span>
                                        <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </a>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>Find us in major cities across the region</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
