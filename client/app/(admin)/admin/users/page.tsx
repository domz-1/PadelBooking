"use client";

import { useEffect, useState, useCallback } from "react";
import { User, adminUserService } from "@/lib/services/admin/users.service";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "@/components/ui/file-upload-dialog";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebounce(searchInput, 500);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchQuery,
      };

      if (activeTab === "normal") {
        params.isGuest = false;
      } else if (activeTab === "guest") {
        params.isGuest = true;
      }

      const response = await adminUserService.getAll(params);
      setData(response.data);
      setTotalUsers(response.count);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [pagination, searchQuery, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <div className="flex items-center gap-2">
          <FileUploadDialog
            title="Import Users"
            onUpload={adminUserService.importUsers}
            triggerLabel="Import Users"
            description="Upload a CSV or Excel file with columns: name, email, phone, role (optional)"
          />
          <Button onClick={() => router.push("/admin/users/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          defaultValue="all"
          className="w-full sm:w-auto"
          onValueChange={setActiveTab}
        >
        </Tabs>
        <div className="w-full sm:w-full mt-7">
          <Input
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="all" className="mt-0">
          <DataTable
            columns={columns}
            data={data}
            pageCount={Math.ceil(totalUsers / pagination.pageSize)}
            pagination={pagination}
            onPaginationChange={setPagination}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="normal" className="mt-0">
          <DataTable
            columns={columns}
            data={data}
            pageCount={Math.ceil(totalUsers / pagination.pageSize)}
            pagination={pagination}
            onPaginationChange={setPagination}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="guest" className="mt-0">
          <DataTable
            columns={columns}
            data={data}
            pageCount={Math.ceil(totalUsers / pagination.pageSize)}
            pagination={pagination}
            onPaginationChange={setPagination}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
