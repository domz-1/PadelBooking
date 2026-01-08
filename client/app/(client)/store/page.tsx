"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle, Plus, Minus, Filter, Search, ChevronRight, Phone } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useBrandingStore } from "@/hooks/use-branding-store";
import { API_BASE_URL } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number | null;
  isPriceless: boolean;
  image: string;
  categoryId: number;
  showInLanding: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  const { addItem } = useCart();
  const { config } = useBrandingStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/products`, {
            params: {
              page: currentPage,
              limit: pageSize,
              categoryId: selectedCategory,
              search: searchQuery
            }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/store/categories`)
        ]);

        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
          setTotalCount(productsRes.data.count);
          const q: { [key: number]: number } = {};
          productsRes.data.data.forEach((p: Product) => q[p.id] = 1);
          setQuantities(q);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, searchQuery]);

  // Products are filtered on the backend now, but we keep the logic here for safety or smaller sets
  const filteredProducts = products;

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: Product) => {
    if (product.isPriceless) {
      window.open("https://t.me/your_bot", "_blank");
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

  const storeLogo = config?.storeLogo || config?.logo;
  const storeName = config?.storeName || "Padel Pro Store";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header / Search */}
      <div className="bg-white dark:bg-zinc-900 border-b pt-12 pb-8 container mx-auto px-4 pt-12 max-w-7xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 mb-8">
            {storeLogo && (
              <div className="w-16 h-16 relative">
                <Image
                  src={storeLogo.startsWith('http') ? storeLogo : `${API_BASE_URL}/${storeLogo}`}
                  alt={storeName}
                  fill
                  className="object-contain rounded-sm"
                  unoptimized
                />
              </div>
            )}
            <h1 className="text-4xl font-extrabold">{storeName}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full whitespace-nowrap"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {config?.storePhone && (
              <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                <div className="bg-primary p-2 rounded-xl">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store Support</p>
                  <p className="text-sm font-black">{config.storePhone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            {searchQuery || selectedCategory ? (
              <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-sm font-medium">
                  Showing {filteredProducts.length} results
                  {searchQuery && <span> for &ldquo;<span className="text-primary font-bold">{searchQuery}</span>&rdquo;</span>}
                  {selectedCategory && <span> in <span className="text-primary font-bold">{categories.find(c => c.id === selectedCategory)?.name}</span></span>}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest hover:text-red-500"
                  onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                >
                  Reset
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-medium">Explore our premium selection of padel equipment</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Sorted by: Newest</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-16">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-16 gap-y-24 pt-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative rounded-[2rem] bg-card p-5 pt-24 shadow-lg shadow-zinc-200/40 dark:shadow-none border dark:border-zinc-800/50 transition-all">

                  {/* Floating Image */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 flex items-center justify-center">
                    <Image
                      src={product.image || "/images/product-padel.png"}
                      alt={product.name}
                      width={160}
                      height={160}
                      className="object-contain mix-blend-multiply dark:mix-blend-normal"
                      unoptimized
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/5 blur-xl rounded-full scale-x-150"></div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter py-0 px-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                          {categories.find(c => c.id === product.categoryId)?.name || 'Gear'}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold leading-tight line-clamp-2 min-h-10">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                        {product.description || "High-quality professional padel equipment."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col">
                        {product.isPriceless ? (
                          <span className="text-[10px] font-semibold text-primary">Message for price</span>
                        ) : (
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black">{Number(product.price).toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">EGP</span>
                          </div>
                        )}
                      </div>

                      {!product.isPriceless && (
                        <div className="flex items-center bg-muted/30 rounded-full p-0.5 scale-75">
                          <button onClick={() => handleQuantityChange(product.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                          <span className="w-5 text-center text-xs font-bold">{quantities[product.id] || 1}</span>
                          <button onClick={() => handleQuantityChange(product.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full h-10 rounded-xl font-bold text-sm shadow-md shadow-primary/5 transition-all hover:scale-[1.02]"
                      size="sm"
                    >
                      {product.isPriceless ? <MessageCircle className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                      {product.isPriceless ? "Contact Us" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground">Try adjusting your category or search terms.</p>
            <Button variant="link" onClick={() => { setSelectedCategory(null); setSearchQuery(""); setCurrentPage(1); }} className="mt-4">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="bg-white dark:bg-zinc-900 border rounded-full px-6 py-2 shadow-sm">
              <span className="text-sm font-bold">
                Page <span className="text-primary">{currentPage}</span> of {Math.ceil(totalCount / pageSize)}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
