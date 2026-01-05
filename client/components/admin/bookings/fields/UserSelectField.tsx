"use client";

import { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { User } from "@/lib/schemas";

interface UserSelectFieldProps {
  form: UseFormReturn<{
    date: Date;
    startTime: string;
    endTime: string;
    totalPrice: number;
    userId: number;
    venueId: number;
    statusId?: number;
    type: "standard" | "academy";
    hasOffer: boolean;
    offerValue: number;
    notes?: string;
  }>;
  users: User[];
  setUserSearch: (search: string) => void;
}

export function UserSelectField({
  form,
  users,
  setUserSearch,
}: UserSelectFieldProps) {
  const [localSearch, setLocalSearch] = useState("");

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearch(localSearch);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localSearch, setUserSearch]);

  return (
    <FormField
      control={form.control}
      name="userId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <Select
            onValueChange={(v) => field.onChange(Number(v))}
            value={field.value ? String(field.value) : undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <div className="flex items-center px-3 pb-2 pt-1">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search by name, email or mobile..."
                  className="h-8 w-full bg-transparent p-0 focus-visible:ring-0"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[250px] overflow-auto">
                {users.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem
                      key={`user-select-${user.id}`}
                      value={String(user.id)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                          {user.name}
                        </span>
                        <div className="flex flex-col gap-0 text-[10px] text-muted-foreground">
                          <span>{user.email}</span>
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
