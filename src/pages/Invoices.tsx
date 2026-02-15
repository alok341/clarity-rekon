import { PageHeader, StatusBadge } from "@/components/SharedComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/data/mockData";
import { invoices } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [backendResult, setBackendResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        !search ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.supplier.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // ✅ FIXED UPLOAD FUNCTION
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // 🔥 MUST MATCH BACKEND PARAM NAME

    try {
      const response = await fetch("http://localhost:8000/upload-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setBackendResult(data);

      toast({
        title: "Success",
        description: "Invoice processed successfully",
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload invoice",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage and track all invoices"
      >
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Invoice
        </Button>
      </PageHeader>

      {/* Hidden File Input */}
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="discrepancy">Discrepancy</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.supplier}</TableCell>
                    <TableCell className="text-right">
                      ${inv.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {backendResult && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Extraction Result</h3>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(backendResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(v) => !v && setSelectedInvoice(null)}
      >
        <DialogContent>
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedInvoice.invoiceNumber}
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-2">
                <p>Supplier: {selectedInvoice.supplier}</p>
                <p>Amount: ${selectedInvoice.amount.toFixed(2)}</p>
                <p>Date: {selectedInvoice.date}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
