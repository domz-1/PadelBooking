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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Phone, Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { User } from "@/lib/schemas";

interface UserSelectFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  users: User[];
  setUserSearch: (search: string) => void;
  loadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  onQuickCreate?: (search: string) => void;
  onUserCreated?: (user: User) => void;
  initialUser?: User | null;
}

export function UserSelectField<T extends FieldValues>({
  form,
  users,
  setUserSearch,
  loadMore,
  hasMore,
  loading,
  onQuickCreate,
  onUserCreated,
  initialUser,
}: UserSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearch(localSearch);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localSearch, setUserSearch]);

  // Handle onUserCreated to update local newlyCreatedUser state
  useEffect(() => {
    if (onUserCreated) {
      // This is a bit tricky since onUserCreated is a callback.
      // But we can use it to sync state if we want.
      // Actually, it's better if AdminCreateBookingDialog triggers something.
    }
  }, [onUserCreated]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when scrolled near the bottom (e.g., within 20px)
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (hasMore && !loading && loadMore) {
        loadMore();
      }
    }
  };

  // Helper to get selected user object for display
  const selectedUserId = form.watch("userId" as Path<T>);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<User | null>(null);

  const selectedUser = newlyCreatedUser?.id === selectedUserId
    ? newlyCreatedUser
    : users.find((u) => u.id === selectedUserId) ||
    (selectedUserId === initialUser?.id ? initialUser : null) ||
    (selectedUserId ? { id: selectedUserId, name: "Selected User", email: "", phone: "" } : null);

  return (
    <FormField
      control={form.control}
      name={"userId" as Path<T>}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Customer</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between pl-3 text-left font-normal h-auto min-h-10",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {selectedUser ? (
                    <div className="flex flex-col gap-0 py-1">
                      <span className="font-semibold text-[14px] text-left">
                        {(selectedUser as User).name.replace(/[^a-zA-Z\s]/g, "")}
                      </span>
                      <div className="flex flex-col gap-0 text-[10px] opacity-80">
                        <span>{(selectedUser as User).email}</span>
                        {(selectedUser as User).phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {(selectedUser as User).phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    "Select customer"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search by name, email or mobile..."
                  value={localSearch}
                  onValueChange={setLocalSearch}
                  className="h-9"
                />
                <CommandList
                  className="max-h-[250px] overflow-auto"
                  onScroll={handleScroll}
                >
                  {users.length === 0 && !loading && localSearch && (
                    <div className="py-6 text-center text-sm px-4">
                      <p className="text-muted-foreground mb-4">No users found for &quot;{localSearch}&quot;</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onQuickCreate) onQuickCreate(localSearch);
                          setOpen(false);
                        }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Add as new user?
                      </Button>
                    </div>
                  )}
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={`user-select-${user.id}`}
                        value={String(user.id)}
                        onSelect={() => {
                          field.onChange(user.id);
                          setOpen(false);
                        }}
                        className="cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            user.id === field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col gap-0">
                          <span className="font-semibold text-[14px] text-left">
                            {user.name.replace(/[^a-zA-Z\s]/g, "")}
                          </span>
                          <div className="flex flex-col gap-0 text-[10px] opacity-80">
                            <span>{user.email}</span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                    {loading && (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        Loading more...
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
