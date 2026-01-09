"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, adminUserService } from "@/lib/services/admin/users.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Ban, CheckCircle, KeyRound, Eye, MoreHorizontal, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { columns } from "@/app/(admin)/admin/bookings/columns";
import { DataTable } from "@/components/ui/data-table";
import { adminBookingService } from "@/lib/services/admin/bookings.service";
import Image from "next/image";
import type { Booking } from "@/lib/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminStoreService, type Order } from "@/lib/services/admin/store.service";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "@/lib/api";

export default function ViewUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await adminUserService.getById(Number(params.id));
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!user) return;
    try {
      await adminUserService.deleteUser(user.id);
      toast.success("User deleted");
      router.push("/admin/users");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      if (user.isActive) {
        await adminUserService.banUser(user.id);
      } else {
        await adminUserService.updateUser(user.id, { isActive: true });
      }
      setUser({ ...user, isActive: !user.isActive });
      toast.success(user.isActive ? "User blocked" : "User activated");
    } catch {
      toast.error("Failed to update user status");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>

          <ConfirmDialog
            title="Reset Password"
            description="This will generate a random password for the user. Are you sure?"
            onConfirm={async () => {
              if (!user?.id) return;
              const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
              try {
                await adminUserService.updateUser(user.id, { password: newPassword });
                await navigator.clipboard.writeText(`Email: ${user.email}\nPassword: ${newPassword}`);
                toast.success("Password reset and credentials copied to clipboard");
              } catch {
                toast.error("Failed to reset password");
              }
            }}
          >
            <Button variant="outline">
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </ConfirmDialog>

          <ConfirmDialog
            title={user.isActive ? "Ban User" : "Activate User"}
            description={`Are you sure you want to ${user.isActive ? "ban" : "activate"} this user?`}
            onConfirm={handleToggleStatus}
          >
            <Button
              variant={user.isActive ? "destructive" : "default"}
              className={
                !user.isActive ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {user.isActive ? (
                <Ban className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {user.isActive ? "Ban User" : "Activate User"}
            </Button>
          </ConfirmDialog>

          <ConfirmDialog
            title="Delete User"
            description="Are you sure you want to delete this user? This action cannot be undone."
            onConfirm={handleDelete}
          >
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </ConfirmDialog>
        </div>
      </div>


      {user.image && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-32 h-32 rounded-full overflow-hidden border">
              <Image
                src={user.image}
                alt={user.name}
                width={128}
                height={128}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p>{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? "Active" : "Banned"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Joined
              </p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Type
              </p>
              <Badge variant={user.isGuest ? "outline" : "secondary"}>
                {user.isGuest ? "Guest" : "Member"}
              </Badge>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{user.phone}</p>
              </div>
            )}
            {user.bio && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">User Bookings</TabsTrigger>
          <TabsTrigger value="orders">User Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="space-y-4">
          <BookingsTable userId={Number(user.id)} />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <OrdersTable userId={Number(user.id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingsTable({ userId }: { userId: number }) {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminBookingService.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        userId: userId,
      });
      setData(response.data);
      setTotalBookings(response.count);
    } catch (error) {
      console.error("Failed to fetch user bookings", error);
      toast.error("Failed to fetch user bookings");
    } finally {
      setLoading(false);
    }
  }, [userId, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const userColumns = columns(fetchBookings).filter((col) => col.id !== "user");

  if (loading) return <div>Loading bookings...</div>;

  return (
    <DataTable
      columns={userColumns}
      data={data}
      pageCount={Math.ceil(totalBookings / pagination.pageSize)}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

function OrdersTable({ userId }: { userId: number }) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminStoreService.getOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        userId: userId,
      });
      setData(response.data);
      setTotalOrders(response.count);
    } catch (error) {
      console.error("Failed to fetch user orders", error);
      toast.error("Failed to fetch user orders");
    } finally {
      setLoading(false);
    }
  }, [userId, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const res = await adminStoreService.updateOrderStatus(orderId, status);
      if (res.success) {
        toast.success(`Order #${orderId} status updated to ${status}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const orderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => `#${row.getValue("id")}`,
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

  if (loading) return <div>Loading orders...</div>;

  return (
    <>
      <DataTable
        columns={orderColumns}
        data={data}
        pageCount={Math.ceil(totalOrders / pagination.pageSize)}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

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
                  {/* Items List */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Ordered Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.OrderItems?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border shadow-sm">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2">
                            {item.Product?.image && (
                              <Image
                                src={item.Product.image.startsWith('http') ? item.Product.image : `${API_BASE_URL}/${item.Product.image}`}
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
                <div className="text-right w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                  <p className="text-3xl font-black text-primary">{Number(selectedOrder.totalAmount).toLocaleString()} <span className="text-xs">EGP</span></p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
