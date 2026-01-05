"use client";

import { useEffect, useState } from "react";
import { settingsService } from "@/lib/services/settings.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BookingStatusManagement } from "@/components/admin/settings/BookingStatusManagement";

type ConfigType = Record<string, unknown>;
export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await settingsService.getConfig();
      setConfig(res.data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await settingsService.updateConfig(config);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
          <CardDescription>Manage general system settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={config?.appName || ""}
                onChange={(e) =>
                  setConfig({ ...config, appName: e.target.value })
                }
              />
            </div>
            {/* Add more config fields as needed based on backend model */}
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = "/admin/settings/branding")
              }
            >
              Customize Branding & Colors
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Statuses</CardTitle>
          <CardDescription>
            Manage booking status types and their colors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingStatusManagement />
        </CardContent>
      </Card>
    </div>
  );
}
