"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Package, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface Order {
  id: number;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  OrderItems: {
    id: number;
    quantity: number;
    price: number;
    Product: {
      name: string;
      image: string;
    };
  }[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/orders`,
          {
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          },
        );
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="container mx-auto p-12 text-center">
        Loading orders...
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black">My Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your recent purchases
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border">
            <p className="text-muted-foreground mb-6">
              You haven&apos;t placed any orders yet.
            </p>
            <a href="/store" className="text-primary font-bold hover:underline">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="rounded-[2.5rem] overflow-hidden border-none shadow-xl shadow-zinc-200/50"
              >
                <div className="bg-white dark:bg-zinc-900 p-8">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                      </div>
                      <h2 className="text-2xl font-black">Order #{order.id}</h2>
                    </div>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {order.OrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-6 group"
                      >
                        <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          <Image
                            src={item.Product.image}
                            alt={item.Product.name}
                            width={50}
                            height={50}
                            className="object-contain unoptimized"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold group-hover:text-primary transition-colors">
                            {item.Product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {item.price} EGP
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {(item.quantity * item.price).toLocaleString()} EGP
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-2xl">
                      <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-sm">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-xs">
                        <p className="text-muted-foreground uppercase font-bold tracking-tighter">
                          Payment Method
                        </p>
                        <p className="font-black capitalize">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium">
                        Total Amount
                      </p>
                      <p className="text-3xl font-black text-primary">
                        {Number(order.totalAmount).toLocaleString()}{" "}
                        <span className="text-sm">EGP</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
