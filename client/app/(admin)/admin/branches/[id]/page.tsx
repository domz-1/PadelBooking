"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminBranchService } from "@/lib/services/admin/branches.service";
import type { Branch } from "@/lib/schemas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ViewBranchPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!params.id) return;
      try {
        const data = await adminBranchService.getById(Number(params.id));
        setBranch(data);
      } catch (error) {
        console.error("Failed to fetch branch", error);
        toast.error("Failed to fetch branch details");
        router.push("/admin/branches");
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [params.id, router]);

  if (loading) return <div>Loading...</div>;
  if (!branch) return <div>Branch not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/branches")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Branch Details</h1>
        <div className="ml-auto">
          <Button
            onClick={() => router.push(`/admin/branches/${branch.id}/edit`)}
          >
            Edit Branch
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{branch.name}</CardTitle>
              <CardDescription className="mt-1">
                Created on{" "}
                {branch.createdAt
                  ? new Date(branch.createdAt).toLocaleDateString()
                  : "N/A"}
              </CardDescription>
            </div>
            <Badge variant={branch.isActive ? "default" : "secondary"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="font-semibold">
                    {branch.location || "No location set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                {branch.isActive ? (
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 mr-3 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="font-semibold">
                    {branch.isActive ? "Operational" : "Closed / Inactive"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="border rounded-lg p-4 bg-muted/10 min-h-[100px]">
                <p className="text-sm whitespace-pre-wrap">
                  {branch.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Associated Venues</CardTitle>
          <CardDescription>Venues managed by this branch.</CardDescription>
        </CardHeader>
        <CardContent>
          {branch.Venues && branch.Venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branch.Venues.map((venue) => (
                <div
                  key={venue.id}
                  className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-semibold">{venue.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {venue.type || "Standard"}
                  </p>
                  <div className="mt-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-xs text-muted-foreground mr-2">
                      Price/Hr
                    </span>
                    <Badge variant="outline">${venue.pricePerHour}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No venues assigned to this branch yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
