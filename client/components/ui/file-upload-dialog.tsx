"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportResult {
  success: boolean;
  message: string;
  errors?: string[];
  importSummary?: {
    totalRows: number;
    successCount: number;
    failedCount: number;
  };
  summary?: {
    total: number;
    created: number;
    updated: number;
    failed: number;
  };
}

interface FileUploadDialogProps {
  title: string;
  onUpload: (file: File) => Promise<ImportResult>;
  triggerLabel?: string;
  description?: string;
}

export function FileUploadDialog({
  title,
  onUpload,
  triggerLabel = "Import",
  description,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await onUpload(file);
      setResult(response);

      if (
        response.success &&
        (!response.errors || response.errors.length === 0)
      ) {
        toast({
          title: "Success",
          description: "File imported successfully",
        });
        setOpen(false);
        setFile(null);
        setResult(null);
      } else {
        toast({
          title: response.success ? "Imported with issues" : "Import Failed",
          description: response.message,
          variant: response.success ? "default" : "destructive",
        });
      }
    } catch (error: unknown) {
      const errorData =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : null;
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Import Failed",
        description:
          (errorData as { message?: string })?.message ||
          "Something went wrong during import",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      if (!loading) {
        setFile(null);
        setResult(null);
      }
    }
  };

  const summary = result?.importSummary || result?.summary;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}

          {!result && (
            <div className="space-y-2">
              <Label>Select File (CSV or Excel)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={result.success ? "border-green-500 bg-green-50" : ""}
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.success ? "Import Processed" : "Import Failed"}
                </AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {summary && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-500 font-medium">TOTAL</p>
                    <p className="text-xl font-bold">
                      {"total" in summary ? summary.total : summary.totalRows}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-medium">
                      SUCCESS
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {"created" in summary
                        ? summary.created + summary.updated
                        : summary.successCount}
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600 font-medium">FAILED</p>
                    <p className="text-xl font-bold text-red-700">
                      {"failed" in summary
                        ? summary.failed
                        : summary.failedCount}
                    </p>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Error Details ({result.errors.length})
                  </Label>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-red-50/30">
                    <ul className="space-y-2">
                      {result.errors.map((err, i) => (
                        <li
                          key={i}
                          className="text-xs text-red-700 border-b border-red-100 pb-1 last:border-0"
                        >
                          {err}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setResult(null)}
              >
                Try Again / Upload Another
              </Button>
            </div>
          )}
        </div>

        {!result && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Import
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
