"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "@/lib/services/user.service";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle, MapPin, Trophy } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function PartnersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ level: "", region: "" });
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      // Using findPartners for now, in real app use findPartners with query params
      const res = await userService.findPartners();
      // Filter out current user
      setUsers(res.data.filter((u) => u.id !== currentUser?.id));
    } catch {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleMessage = (userId: number) => {
    router.push(`/chat?userId=${userId}`);
  };

  // Client-side filtering for demo
  const filteredUsers = users.filter((user) => {
    if (filters.level && user.level !== filters.level) return false;
    // Add more filters as needed
    return true;
  });

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Partners</h1>
          <p className="text-muted-foreground mt-1">
            Connect with other players in your area.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Select
            onValueChange={(val) => setFilters({ ...filters, level: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> {user.level || "Unranked"}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Looking for matches in Cairo
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleMessage(Number(user.id))}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Message
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
