"use client";

import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart } = useCart();
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to place an order");
            router.push("/auth/login?redirect=/cart");
            return;
        }

        if (items.length === 0) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/orders`,
                {
                    items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                    paymentMethod: "cash"
                },
                {
                    headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
                }
            );

            if (response.data.success) {
                toast.success("Order placed successfully!");
                clearCart();
                router.push("/orders");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="max-w-md mx-auto space-y-8">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto scale-110 shadow-inner">
                        <ShoppingBag className="h-16 w-16 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black">Your cart is empty</h1>
                        <p className="text-muted-foreground text-lg">
                            Looks like you haven't added anything to your cart yet. Explore our store for the best padel gear!
                        </p>
                    </div>
                    <Button asChild size="lg" className="rounded-2xl h-14 px-10 text-lg font-bold">
                        <Link href="/store">Start Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-4xl font-black mb-12">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-card rounded-3xl p-6 shadow-sm border flex flex-col sm:flex-row gap-6 items-center">
                                <div className="w-32 h-32 bg-muted/50 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden group">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={100}
                                        height={100}
                                        className="object-contain group-hover:scale-110 transition-transform duration-500 unoptimized"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <p className="text-2xl font-black text-primary">
                                        {Number(item.price).toLocaleString()} <span className="text-xs font-bold text-muted-foreground">EGP</span>
                                    </p>

                                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                                        <div className="flex items-center bg-muted/50 rounded-full p-1 border">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center font-black">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-full"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
                                    <p className="text-xl font-black">
                                        {(item.price * item.quantity).toLocaleString()} <span className="text-xs">EGP</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-card rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 border space-y-8 sticky top-24">
                        <h2 className="text-2xl font-black">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-bold text-foreground">{subtotal.toLocaleString()} EGP</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-primary font-bold">FREE</span>
                            </div>
                            <hr className="border-dashed" />
                            <div className="flex justify-between text-xl font-black">
                                <span>Total</span>
                                <span className="text-primary">{subtotal.toLocaleString()} EGP</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex gap-4">
                                <CreditCard className="h-6 w-6 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Cash on Delivery</p>
                                    <p className="text-xs text-muted-foreground">Pay when you receive your order at the club.</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
                            >
                                {isSubmitting ? "Processing..." : (
                                    <>
                                        Checkout <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground px-4">
                                By placing an order, you agree to our terms of service and pick-up policies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
