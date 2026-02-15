import { useState, useMemo } from "react";
import { digitalRecords } from "@/data/mockData";
import { PageHeader, StatusBadge } from "@/components/SharedComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Import, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { delay } from "@/lib/api";

export default function DigitalRecords() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return digitalRecords.filter((r) => {
      const matchSearch = !search || r.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === "all" || r.sourceSystem === sourceFilter;
      return matchSearch && matchSource;
    });
  }, [search, sourceFilter]);

  const handleImport = async () => {
    setImporting(true);
    await delay(2000);
    setImporting(false);
    toast({ title: "Import Complete", description: "156 records imported from CSV file." });
  };

  const handleAddManual = () => {
    toast({ title: "Record Added", description: "Manual record has been saved." });
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Digital Records" description="Records from ERP and accounting systems">
        <Button variant="outline" onClick={handleImport} disabled={importing}>
          {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Import className="mr-2 h-4 w-4" />}
          {importing ? "Importing..." : "Import Records"}
        </Button>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ERP">ERP</SelectItem>
                <SelectItem value="Accounting">Accounting</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
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
                  <TableHead>Record ID</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>PO #</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((r) => (
                  <TableRow key={r.id} className="data-table-row">
                    <TableCell className="font-medium font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.invoiceNumber}</TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell className="text-right">${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>
                      <span className="status-badge bg-primary/10 text-primary">{r.sourceSystem}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.poNumber}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t p-4 text-sm text-muted-foreground">
            Showing {Math.min(20, filtered.length)} of {filtered.length} records
          </div>
        </CardContent>
      </Card>

      {/* Add Manual Record */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Invoice Number</Label><Input className="mt-1" placeholder="INV-2024-XXXXX" /></div>
            <div><Label>Supplier</Label><Input className="mt-1" placeholder="Supplier name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount</Label><Input className="mt-1" type="number" placeholder="0.00" /></div>
              <div><Label>Date</Label><Input className="mt-1" type="date" /></div>
            </div>
            <div><Label>PO Number</Label><Input className="mt-1" placeholder="PO-XXXX" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddManual}>Save Record</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
