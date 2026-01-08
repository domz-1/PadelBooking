"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useBrandingStore } from "@/hooks/use-branding-store";
import { Badge } from "@/components/ui/badge";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number | null;
    isPriceless: boolean;
    image: string;
    categoryId: number;
}

export function FeaturedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const { addItem } = useCart();
    const { config } = useBrandingStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/products?showInLanding=true`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/categories`)
                ]);

                if (prodRes.data.success) {
                    setProducts(prodRes.data.data);
                    const q: { [key: number]: number } = {};
                    prodRes.data.data.forEach((p: Product) => q[p.id] = 1);
                    setQuantities(q);
                }
                if (catRes.data.success) {
                    setCategories(catRes.data.data);
                }
            } catch (error) {
                console.error("Error fetching featured data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleQuantityChange = (id: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    const handleAddToCart = (product: Product) => {
        if (product.isPriceless) {
            const phoneNumber = config?.supportNumber1 || "01001234567";
            const message = encodeURIComponent(`Hi! I'm interested in the ${product.name}. Could you provide more details?`);
            window.open(`https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${message}`, "_blank");
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image: product.image,
            quantity: quantities[product.id] || 1
        });
        toast.success(`Added ${quantities[product.id]} ${product.name} to cart`);
    };

    if (loading) {
        return (
            <div className="py-24 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-muted rounded mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl px-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 bg-muted/50 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-32 bg-linear-to-b from-background to-muted/30 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Featured {config?.storeName || 'Padel'} Gear
                    </h2>
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                        High-quality professional equipment curated for the best performance on the court.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-20 gap-y-32 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full">
                    {products.map((product) => (
                        <div key={product.id} className="group relative">
                            {/* Product Card */}
                            <div className="relative rounded-3xl bg-white dark:bg-zinc-900 p-6 pt-24 shadow-xl transition-all duration-500 border border-zinc-100 dark:border-zinc-800/50">

                                {/* Background Glow/Blob */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors duration-500"></div>

                                {/* Floating Image Container */}
                                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-44 h-44 transition-all duration-700 ease-out drop-shadow-lg flex items-center justify-center">
                                    <Image
                                        src={product.image || "/images/product-padel.png"}
                                        alt={product.name}
                                        width={180}
                                        height={180}
                                        className="object-contain mix-blend-multiply dark:mix-blend-normal"
                                        unoptimized
                                    />
                                    {/* Reflection/Shadow under image */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/5 blur-xl rounded-full scale-x-150"></div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter py-0 px-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                                                {categories.find(c => c.id === product.categoryId)?.name || 'Gear'}
                                            </Badge>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 min-h-10">
                                                {product.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                                                {product.description || "Premium professional equipment."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex flex-col text-left">
                                                {product.isPriceless ? (
                                                    <span className="text-[10px] font-semibold text-primary">Message for price</span>
                                                ) : (
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-xl font-black text-foreground">
                                                            {Number(product.price).toLocaleString()}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                            EGP
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {!product.isPriceless && (
                                                <div className="flex items-center bg-muted/50 rounded-full p-0.5 border scale-90">
                                                    <button
                                                        onClick={() => handleQuantityChange(product.id, -1)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-5 text-center font-bold text-xs">
                                                        {quantities[product.id] || 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(product.id, 1)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full h-10 rounded-2xl text-xs font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
                                        >
                                            {product.isPriceless ? (
                                                <>
                                                    <MessageCircle className="mr-2 h-4 w-4" />
                                                    Contact Us
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
