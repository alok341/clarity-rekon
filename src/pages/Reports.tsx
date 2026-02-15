import { PageHeader } from "@/components/SharedComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { discrepancies, monthlyData } from "@/data/mockData";
import { Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const discTypeData = [
  { name: "Amount", value: discrepancies.filter((d) => d.type === "amount").length, fill: "hsl(var(--chart-4))" },
  { name: "Date", value: discrepancies.filter((d) => d.type === "date").length, fill: "hsl(var(--chart-3))" },
  { name: "Supplier", value: discrepancies.filter((d) => d.type === "supplier").length, fill: "hsl(var(--chart-1))" },
  { name: "Items", value: discrepancies.filter((d) => d.type === "items").length, fill: "hsl(var(--chart-5))" },
  { name: "Duplicate", value: discrepancies.filter((d) => d.type === "duplicate").length, fill: "hsl(var(--chart-2))" },
];

const resolveTimeData = [
  { range: "< 1 hour", count: 4 },
  { range: "1-4 hours", count: 3 },
  { range: "4-24 hours", count: 2 },
  { range: "1-3 days", count: 1 },
];

export default function Reports() {
  const { toast } = useToast();
  const resolved = discrepancies.filter((d) => d.resolved).length;
  const total = discrepancies.length;

  const handleExport = (type: string) => {
    toast({ title: "Export Started", description: `Generating ${type} report...` });
    setTimeout(() => toast({ title: "Export Ready", description: `${type} report downloaded.` }), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Reconciliation analytics and insights">
        <Button variant="outline" onClick={() => handleExport("PDF")}>
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button variant="outline" onClick={() => handleExport("Excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Discrepancies</p>
            <p className="text-3xl font-bold mt-1">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-3xl font-bold text-success mt-1">{resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-3xl font-bold text-warning mt-1">{total - resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Resolution Rate</p>
            <p className="text-3xl font-bold mt-1">{((resolved / total) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discrepancy by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={discTypeData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label>
                  {discTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time to Resolve</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolveTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Reconciliation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                <Bar dataKey="reconciled" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Reconciled" />
                <Bar dataKey="discrepancies" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Discrepancies" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
