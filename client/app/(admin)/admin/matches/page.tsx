"use client";

import { useEffect, useState } from "react";
import { Match, adminMatchService } from "@/lib/services/admin/matches.service";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function MatchesPage() {
  const [data, setData] = useState<Match[]>([]);
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await adminMatchService.getAll();
        setData(response.data || []);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Matches Management
        </h1>
      </div>
      <DataTable columns={columns} data={data} searchKey="level" />
    </div>
  );
}
