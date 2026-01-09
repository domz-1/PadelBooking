"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { settingsService } from "@/lib/services/settings.service";
import { Loader2, Palette, Image as ImageIcon, Type, Save, ShoppingCart, Phone, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useBrandingStore } from "@/hooks/use-branding-store";
import { API_BASE_URL } from "@/lib/api";

const brandingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  logo: z.string().optional(),
  themeColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  primaryForeground: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  sidebarColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  supportNumber1: z.string().optional(),
  supportNumber2: z.string().optional(),
  storeName: z.string().optional(),
  storePhone: z.string().optional(),
  storeLogo: z.string().optional(),
  showStore: z.boolean().optional(),
  showAcademy: z.boolean().optional(),
  showSponsors: z.boolean().optional(),
  cancelationLimit: z.number().min(0).optional(),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function BrandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);
  const { fetchConfig } = useBrandingStore();

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema as any),
    defaultValues: {
      businessName: "",
      logo: "",
      themeColor: "#4CAF50",
      secondaryColor: "#2E7D32",
      accentColor: "#81C784",
      primaryForeground: "#FFFFFF",
      sidebarColor: "#FFFFFF",
      supportNumber1: "",
      supportNumber2: "",
      storeName: "",
      storePhone: "",
      storeLogo: "",
      showStore: true,
      showAcademy: true,
      showSponsors: true,
      cancelationLimit: 24,
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await settingsService.getConfig();
        const data = res.data;
        form.reset({
          businessName: data.businessName || "",
          logo: data.logo || "",
          themeColor: data.themeColor || "#4CAF50",
          secondaryColor: data.secondaryColor || "#2E7D32",
          accentColor: data.accentColor || "#81C784",
          primaryForeground: data.primaryForeground || "#FFFFFF",
          sidebarColor: data.sidebarColor || "#FFFFFF",
          supportNumber1: data.supportNumber1 || "",
          supportNumber2: data.supportNumber2 || "",
          storeName: data.storeName || "",
          storePhone: data.storePhone || "",
          storeLogo: data.storeLogo || "",
          showStore: typeof data.showStore === 'boolean' ? data.showStore : true,
          showAcademy: typeof data.showAcademy === 'boolean' ? data.showAcademy : true,
          showSponsors: typeof data.showSponsors === 'boolean' ? data.showSponsors : true,
          cancelationLimit: data.cancelationLimit ?? 24,
        });
        setLogoPreview(data.logo || null);
        setStoreLogoPreview(data.storeLogo || null);
      } catch {
        toast.error("Failed to load branding settings");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [form]);

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      await settingsService.updateConfig(values);
      await fetchConfig(true); // Force refresh global branding store
      toast.success("Branding settings updated");
    } catch {
      toast.error("Failed to update branding settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await settingsService.uploadLogo(file);
      form.setValue("logo", res.logoUrl);
      setLogoPreview(res.logoUrl);
      toast.success("Logo uploaded successfully");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await settingsService.uploadLogo(file);
      form.setValue("storeLogo", res.logoUrl);
      setStoreLogoPreview(res.logoUrl);
      toast.success("Store logo uploaded successfully");
    } catch {
      toast.error("Failed to upload store logo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Branding</h1>
          <p className="text-muted-foreground">
            Customize your system appearance, brand name, and logo.
          </p>
        </div>
      </div>

      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Feature Visibility
              </CardTitle>
              <CardDescription>
                Toggle major features of the system on or off.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="showStore"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Store</FormLabel>
                      <FormDescription>
                        Display store links and featured products to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="showAcademy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Academy</FormLabel>
                      <FormDescription>
                        Display academy links and sections to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="showSponsors"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Sponsors</FormLabel>
                      <FormDescription>
                        Display sponsor logos and sections to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="cancelationLimit"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Cancellation Limit (Hours)</FormLabel>
                    <FormDescription>
                      Users can cancel their bookings up to this many hours before the start time.
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>
                Configure your business name and logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full space-y-4">
                  <FormField
                    control={form.control as any}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="logo"
                    render={() => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={uploading}
                            />
                            <FormDescription>
                              Upload your brand logo (max 5MB).
                            </FormDescription>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full md:w-32 h-32 border rounded-lg flex items-center justify-center bg-muted overflow-hidden relative group">
                  {logoPreview ? (
                    <Image
                      src={logoPreview.startsWith('http') ? logoPreview : `${API_BASE_URL}/${logoPreview}`}
                      alt="Logo preview"
                      unoptimized
                      width={128}
                      height={128}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact & Support
              </CardTitle>
              <CardDescription>
                Configure support contact numbers shown in the landing page and footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="supportNumber1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Number 1</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +20 100 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="supportNumber2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Number 2</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +20 111 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Store Configuration
              </CardTitle>
              <CardDescription>
                Customize how your store appears to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter store name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="storePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Support Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter store phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full">
                  <FormField
                    control={form.control as any}
                    name="storeLogo"
                    render={() => (
                      <FormItem>
                        <FormLabel>Store Logo</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleStoreLogoUpload}
                              disabled={uploading}
                            />
                            <FormDescription>
                              Optional: Separate logo for the store section.
                            </FormDescription>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full md:w-32 h-32 border rounded-lg flex items-center justify-center bg-muted overflow-hidden relative">
                  {storeLogoPreview ? (
                    <Image
                      src={storeLogoPreview.startsWith('http') ? storeLogoPreview : `${API_BASE_URL}/${storeLogoPreview}`}
                      alt="Store Logo preview"
                      unoptimized
                      width={128}
                      height={128}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Palette
              </CardTitle>
              <CardDescription>
                Define your brand colors. These will be applied throughout the
                system.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="themeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color (Theme)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                      </FormControl>
                      <Input placeholder="#000000" {...field} maxLength={7} />
                    </div>
                    <FormDescription>
                      Used for buttons, links, and primary UI elements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                      </FormControl>
                      <Input placeholder="#000000" {...field} maxLength={7} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                      </FormControl>
                      <Input placeholder="#000000" {...field} maxLength={7} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="primaryForeground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Foreground (Text on Theme Color)
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                      </FormControl>
                      <Input placeholder="#000000" {...field} maxLength={7} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="sidebarColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sidebar Background Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                      </FormControl>
                      <Input placeholder="#000000" {...field} maxLength={7} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Branding Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
