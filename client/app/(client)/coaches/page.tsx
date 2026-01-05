"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/lib/services/coach.service";
import { Coach } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const data = await coachService.getAll();
      setCoaches(data.data);
    } catch {
      toast.error("Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Our Coaches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={coach.User?.avatar} />
                <AvatarFallback>{coach.User?.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{coach.User?.name}</CardTitle>
                <CardDescription>Professional Coach</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Experience</h4>
                  <p className="text-sm text-gray-500">{coach.experience}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Bio</h4>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {coach.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
