"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface FileUploadDialogProps {
    title: string;
    onUpload: (file: File) => Promise<any>;
    triggerLabel?: string;
    description?: string;
}

export function FileUploadDialog({ title, onUpload, triggerLabel = "Import", description }: FileUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpload = async () => {
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file first",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await onUpload(file);
            toast({
                title: "Success",
                description: "File imported successfully",
                variant: "default",
                className: "bg-green-500 text-white"
            });
            setOpen(false);
            setFile(null);
        } catch (error: any) {
            toast({
                title: "Import Failed",
                description: error.response?.data?.message || "Something went wrong during import",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {description && <p className="text-sm text-gray-500">{description}</p>}

                    <div className="space-y-2">
                        <Label>Select File (CSV or Excel)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={!file || loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Import
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
