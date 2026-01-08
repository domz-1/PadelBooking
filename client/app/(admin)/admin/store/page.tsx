"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Order,
  Product,
  adminStoreService,
} from "@/lib/services/admin/store.service";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, CheckCircle, XCircle, Clock, Eye, FileUp, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function StorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "orders";

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/admin/store?${params.toString()}`);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Create/Edit Product State
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    isPriceless: false,
    showInLanding: false,
    isActive: true,
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination states
  const [prodPagination, setProdPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [prodTotal, setProdTotal] = useState(0);
  const [ordPagination, setOrdPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [ordTotal, setOrdTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, catRes] = await Promise.all([
        adminStoreService.getProducts({ page: prodPagination.pageIndex + 1, limit: prodPagination.pageSize }),
        adminStoreService.getOrders({ page: ordPagination.pageIndex + 1, limit: ordPagination.pageSize }),
        adminStoreService.getCategories()
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        setProdTotal(prodRes.count);
      }
      if (ordRes.success) {
        setOrders(ordRes.data);
        setOrdTotal(ordRes.count);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      toast.error("Failed to load store data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [prodPagination, ordPagination]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const res = await adminStoreService.updateOrderStatus(orderId, status);
      if (res.success) {
        toast.success(`Order #${orderId} status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await adminStoreService.updateProduct(product.id, { isActive: !product.isActive });
      if (res.success) {
        toast.success(`${product.name} is now ${!product.isActive ? 'active' : 'inactive'}`);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      const res = await adminStoreService.importProducts(importFile);
      if (res.success) {
        toast.success(res.message);
        setIsImportOpen(false);
        setImportFile(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Bulk import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        categoryId: product.categoryId?.toString() || "",
        isPriceless: product.isPriceless,
        showInLanding: (product as any).showInLanding || false,
        isActive: product.isActive,
      });
      setImagePreview(product.image ? (product.image.startsWith('http') ? product.image : `${API_BASE_URL}/${product.image}`) : "/images/product-padel.png");
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        isPriceless: false,
        showInLanding: false,
        isActive: true,
      });
      setImagePreview("/images/product-padel.png");
    }
    setProductImage(null);
    setIsProductOpen(true);
  };

  const handleSaveProduct = async () => {
    setIsSavingProduct(true);
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      if (productImage) {
        formData.append("image", productImage);
      }

      let res;
      if (editingProduct) {
        res = await adminStoreService.updateProduct(editingProduct.id, formData);
      } else {
        res = await adminStoreService.createProduct(formData);
      }

      if (res.success) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setIsProductOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await adminStoreService.deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  // --- Product Columns ---
  const productColumns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Product" },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => categories.find(c => c.id === (row.original as any).categoryId)?.name || "N/A"
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (row.original as any).isPriceless ? "Priceless" : `${row.original.price} EGP`,
    },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenProductDialog(product)}
              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteProduct(product.id)}
              className="h-8 w-8 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // --- Order Columns ---
  const orderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => `#${row.getValue("id")}`,
    },
    {
      accessorKey: "User.name",
      header: "Customer",
      cell: ({ row }) => row.original.User?.name || "Unknown",
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => `${row.original.totalAmount} EGP`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === 'completed' ? 'default' : status === 'pending' ? 'outline' : 'destructive'} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
              className="h-8 w-8 text-primary hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pending')}>
                  <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Set Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const categoryColumns: ColumnDef<Category>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted/10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Store Hub</h1>
            <p className="text-muted-foreground">Manage products, categories and incoming orders.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-card border p-1 rounded-xl">
            <TabsTrigger value="orders" className="rounded-lg px-6">Orders</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg px-6">Products</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg px-6">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden rounded-[2rem]">
              <DataTable
                columns={orderColumns}
                data={orders}
                pageCount={Math.ceil(ordTotal / ordPagination.pageSize)}
                pagination={ordPagination}
                onPaginationChange={setOrdPagination}
              />
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex justify-end mb-4 gap-3">
              <Button onClick={() => handleOpenProductDialog()} className="rounded-xl gap-2 h-10 px-6 font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
              <Button onClick={() => setIsImportOpen(true)} variant="outline" className="rounded-xl gap-2 h-10 px-6 border-zinc-200">
                <FileUp className="h-4 w-4" />
                Bulk Import
              </Button>
            </div>
            <Card className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden rounded-[2rem]">
              <DataTable
                columns={productColumns}
                data={products}
                pageCount={Math.ceil(prodTotal / prodPagination.pageSize)}
                pagination={prodPagination}
                onPaginationChange={setProdPagination}
              />
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden rounded-[2rem]">
              <DataTable
                columns={categoryColumns}
                data={categories}
                pageCount={1}
                pagination={{ pageIndex: 0, pageSize: 100 }}
                onPaginationChange={() => { }}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            {selectedOrder && (
              <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
                <DialogHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-3xl font-black">Order #{selectedOrder.id}</DialogTitle>
                      <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="capitalize px-4 py-1 rounded-full text-xs font-black">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-8 py-4 max-h-[60vh]">
                  <div className="space-y-8">
                    {/* Customer Info */}
                    <div className="bg-muted/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Customer Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Name</p>
                          <p className="font-bold text-lg">{selectedOrder.User?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Email</p>
                          <p className="font-bold">{selectedOrder.User?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone</p>
                          <p className="font-bold">{(selectedOrder.User as any)?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Method</p>
                          <p className="font-bold capitalize">{(selectedOrder as any).paymentMethod || 'Cash'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Ordered Items</h3>
                      <div className="space-y-4">
                        {selectedOrder.OrderItems?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border shadow-sm">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2">
                              {item.Product?.image && (
                                <Image
                                  src={item.Product.image}
                                  alt={item.Product.name}
                                  width={40}
                                  height={40}
                                  className="object-contain unoptimized"
                                  unoptimized
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.Product?.name || 'Unknown Product'}</p>
                              <p className="text-[10px] text-muted-foreground font-bold">Qty: {item.quantity} × {item.price} EGP</p>
                            </div>
                            <p className="font-black">{(item.quantity * item.price).toLocaleString()} EGP</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-8 pt-4 border-t bg-muted/10 flex justify-between items-center">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                    <p className="text-3xl font-black text-primary">{Number(selectedOrder.totalAmount).toLocaleString()} <span className="text-xs">EGP</span></p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Product Dialog */}
        <Dialog open={isProductOpen} onOpenChange={setIsProductOpen}>
          <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
              <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-3xl font-black">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1">
                  Fill in the details below to {editingProduct ? "update" : "create"} a product.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 px-8 py-4 max-h-[70vh]">
                <div className="grid grid-cols-2 gap-8 pb-8">
                  {/* Left Column: Basics */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Pro Carbon Racket"
                        className="rounded-2xl border-zinc-100 bg-muted/30 focus:bg-white transition-all h-12 font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your product..."
                        className="rounded-2xl border-zinc-100 bg-muted/30 focus:bg-white transition-all min-h-[120px] font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price (EGP)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          disabled={productForm.isPriceless}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          className="rounded-2xl border-zinc-100 bg-muted/30 h-12 font-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                          className="rounded-2xl border-zinc-100 bg-muted/30 h-12 font-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                      <Select
                        value={productForm.categoryId}
                        onValueChange={(val) => setProductForm(prev => ({ ...prev, categoryId: val }))}
                      >
                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-muted/30 font-bold">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()} className="font-bold py-3">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column: Imagery & Controls */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Image</Label>
                      <div className="relative group overflow-hidden rounded-[2rem] aspect-square bg-muted/30 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
                        {imagePreview ? (
                          <>
                            <Image src={imagePreview} alt="Preview" fill className="object-contain p-4" unoptimized />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-black text-sm">Change Image</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-2">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Click to upload</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProductImage(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-[2rem] p-6 space-y-4 border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-black uppercase tracking-widest">Priceless</Label>
                          <p className="text-[10px] text-muted-foreground font-bold">Hide price and show "Contact Us"</p>
                        </div>
                        <Switch
                          checked={productForm.isPriceless}
                          onCheckedChange={(val) => setProductForm(prev => ({ ...prev, isPriceless: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-black uppercase tracking-widest">Show in Landing</Label>
                          <p className="text-[10px] text-muted-foreground font-bold">Feature this on home page</p>
                        </div>
                        <Switch
                          checked={productForm.showInLanding}
                          onCheckedChange={(val) => setProductForm(prev => ({ ...prev, showInLanding: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-black uppercase tracking-widest">Active Status</Label>
                          <p className="text-[10px] text-muted-foreground font-bold">Make product visible in store</p>
                        </div>
                        <Switch
                          checked={productForm.isActive}
                          onCheckedChange={(val) => setProductForm(prev => ({ ...prev, isActive: val }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-8 border-t bg-muted/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsProductOpen(false)} className="rounded-xl h-12 px-8 font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  disabled={isSavingProduct || !productForm.name}
                  className="rounded-xl h-12 px-10 font-black shadow-xl shadow-primary/20"
                >
                  {isSavingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="sm:max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Bulk Import Products</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel (.xlsx) file to import products.
                Default placeholder will be used for missing images.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="file">Product List File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkImport}
                disabled={!importFile || isImporting}
                className="rounded-xl gap-2"
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
