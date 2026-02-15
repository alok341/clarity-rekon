import { useState } from "react";
import { discrepancies, invoices, digitalRecords } from "@/data/mockData";
import { PageHeader, StatusBadge } from "@/components/SharedComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle2, ArrowRight, FileText, Database, MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Discrepancy } from "@/data/mockData";

const severityColor: Record<string, string> = {
  low: "bg-info/10 text-info border-info/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Reconciliation() {
  const unresolved = discrepancies.filter((d) => !d.resolved);
  const [selected, setSelected] = useState<Discrepancy | null>(unresolved[0] || null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filteredDisc = filter === "all" ? unresolved : unresolved.filter((d) => d.severity === filter);

  const invoice = selected ? invoices.find((i) => i.id === selected.invoiceId) : null;
  const record = selected ? digitalRecords.find((r) => r.id === selected.digitalRecordId) : null;

  const handleResolve = (action: string) => {
    toast({ title: "Discrepancy Resolved", description: `${selected?.id} — ${action}` });
    const next = filteredDisc.find((d) => d.id !== selected?.id);
    setSelected(next || null);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reconciliation" description="Compare and resolve invoice discrepancies" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Discrepancy List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter severity" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredDisc.map((d) => (
              <Card
                key={d.id}
                className={`cursor-pointer transition-all ${selected?.id === d.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => { setSelected(d); setNote(""); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{d.id}</span>
                    <Badge variant="outline" className={severityColor[d.severity]}>{d.severity}</Badge>
                  </div>
                  <p className="text-sm font-medium">{d.field} Mismatch</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.type} discrepancy</p>
                </CardContent>
              </Card>
            ))}
            {filteredDisc.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                All discrepancies resolved!
              </div>
            )}
          </div>
        </div>

        {/* Comparison View */}
        <div className="lg:col-span-8">
          {selected ? (
            <div className="space-y-4">
              {/* Severity Banner */}
              <div className={`flex items-center gap-3 rounded-lg border p-4 ${severityColor[selected.severity]}`}>
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{selected.field} Discrepancy — {selected.severity.toUpperCase()}</p>
                  <p className="text-xs opacity-80">Type: {selected.type}</p>
                </div>
              </div>

              {/* Side by Side */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Physical Invoice (OCR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Invoice #</span><span>{invoice?.invoiceNumber || selected.invoiceId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span>{invoice?.supplier || "—"}</span></div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "amount" ? "bg-destructive/10" : ""}`}>
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">{selected.type === "amount" ? selected.invoiceValue : invoice ? `$${invoice.amount.toFixed(2)}` : "—"}</span>
                    </div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "date" ? "bg-warning/10" : ""}`}>
                      <span className="text-muted-foreground">Date</span>
                      <span>{selected.type === "date" ? selected.invoiceValue : invoice?.date || "—"}</span>
                    </div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "supplier" ? "bg-warning/10" : ""}`}>
                      <span className="text-muted-foreground">Supplier Name</span>
                      <span>{selected.type === "supplier" ? selected.invoiceValue : invoice?.supplier || "—"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4 text-success" /> Digital Record (ERP)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Record ID</span><span>{record?.id || selected.digitalRecordId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span>{record?.supplier || "—"}</span></div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "amount" ? "bg-destructive/10" : ""}`}>
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">{selected.type === "amount" ? selected.digitalValue : record ? `$${record.amount.toFixed(2)}` : "—"}</span>
                    </div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "date" ? "bg-warning/10" : ""}`}>
                      <span className="text-muted-foreground">Date</span>
                      <span>{selected.type === "date" ? selected.digitalValue : record?.date || "—"}</span>
                    </div>
                    <div className={`flex justify-between rounded p-2 ${selected.type === "supplier" ? "bg-warning/10" : ""}`}>
                      <span className="text-muted-foreground">Supplier Name</span>
                      <span>{selected.type === "supplier" ? selected.digitalValue : record?.supplier || "—"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resolution Actions */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Add Resolution Note</p>
                    <Textarea placeholder="Describe the resolution..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleResolve("Accepted digital record")}>
                      Accept Digital Record
                    </Button>
                    <Button variant="outline" onClick={() => handleResolve("Accepted physical invoice")}>
                      Accept Physical Invoice
                    </Button>
                    <Button variant="secondary" onClick={() => handleResolve("Marked as resolved")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-3 text-success" />
              <p className="font-medium">No discrepancy selected</p>
              <p className="text-sm">Select a discrepancy from the list to begin reconciliation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
