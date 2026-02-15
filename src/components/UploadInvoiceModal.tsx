import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { simulateOCR } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Step = "upload" | "processing" | "review";

interface UploadInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadInvoiceModal({ open, onOpenChange }: UploadInvoiceModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [ocrData, setOcrData] = useState<Awaited<ReturnType<typeof simulateOCR>> | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async () => {
    setStep("processing");
    const data = await simulateOCR();
    setOcrData(data);
    setStep("review");
  }, []);

  const handleProcess = () => {
    toast({ title: "Invoice Processed", description: `${ocrData?.invoiceNumber} has been added successfully.` });
    setStep("upload");
    setOcrData(null);
    onOpenChange(false);
  };

  const reset = () => { setStep("upload"); setOcrData(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Upload Invoice" : step === "processing" ? "Processing Invoice..." : "Review Extracted Data"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(); }}
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Drag & drop your invoice here</p>
            <p className="text-xs text-muted-foreground mb-4">Supports PDF, PNG, JPG up to 10MB</p>
            <Button onClick={handleFile}>
              <FileText className="mr-2 h-4 w-4" /> Select File
            </Button>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-medium">Running OCR extraction...</p>
            <p className="text-xs text-muted-foreground">Analyzing document structure, extracting line items</p>
            <div className="w-64 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary animate-shimmer rounded-full" style={{ width: "60%", backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--primary-foreground) / 0.2), transparent)", backgroundSize: "200% 100%" }} />
            </div>
          </div>
        )}

        {step === "review" && ocrData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              OCR extraction completed successfully — 98.5% confidence
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input defaultValue={ocrData.invoiceNumber} className="mt-1" />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input defaultValue={ocrData.supplier} className="mt-1" />
              </div>
              <div>
                <Label>Date</Label>
                <Input defaultValue={ocrData.date} type="date" className="mt-1" />
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input defaultValue={`$${ocrData.amount.toFixed(2)}`} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Line Items</Label>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ocrData.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={reset}>Re-upload</Button>
              <Button onClick={handleProcess}>Process Invoice</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
