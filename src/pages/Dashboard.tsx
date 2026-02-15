import { useState } from "react";
import {
  FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  Upload, Plus, Zap, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, PageHeader, StatusBadge } from "@/components/SharedComponents";
import {
  dashboardStats, monthlyData, severityData, activities
} from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { simulateReconciliation } from "@/lib/api";

const activityIcons: Record<string, typeof Upload> = {
  upload: Upload, match: CheckCircle2, resolve: CheckCircle2, alert: AlertTriangle, import: Plus,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reconciling, setReconciling] = useState(false);

  const handleAutoReconcile = async () => {
    setReconciling(true);
    toast({ title: "Auto-Reconciliation Started", description: "Processing invoices against digital records..." });
    const result = await simulateReconciliation();
    setReconciling(false);
    toast({ title: "Reconciliation Complete", description: `${result.matched} matched, ${result.discrepancies} discrepancies found.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Invoice reconciliation overview" />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Invoices" value={dashboardStats.totalInvoices.toLocaleString()} icon={FileText} trend="+12% from last month" trendUp />
        <StatCard title="Pending" value={dashboardStats.pendingReconciliation} icon={Clock} trend="5 new today" />
        <StatCard title="Matched" value={dashboardStats.matchedInvoices.toLocaleString()} icon={CheckCircle2} trend="+8% from last month" trendUp />
        <StatCard title="Discrepancy Amt" value={`$${dashboardStats.discrepancyAmount.toLocaleString()}`} icon={AlertTriangle} trend="-15% from last month" trendUp />
        <StatCard title="Success Rate" value={`${dashboardStats.successRate}%`} icon={TrendingUp} trend="+2.1% from last month" trendUp />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/invoices")}>
          <Upload className="h-5 w-5" />
          Upload Invoice
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/digital-records")}>
          <Plus className="h-5 w-5" />
          Add Digital Record
        </Button>
        <Button
          variant="secondary"
          className="h-auto flex-col gap-2 py-4"
          disabled={reconciling}
          onClick={handleAutoReconcile}
        >
          <Zap className={`h-5 w-5 ${reconciling ? "animate-spin" : ""}`} />
          {reconciling ? "Reconciling..." : "Run Auto-Reconciliation"}
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Reconciliation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Line type="monotone" dataKey="reconciled" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="discrepancies" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discrepancy Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/reports")}>
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((a) => {
              const Icon = activityIcons[a.type] || FileText;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    a.type === "alert" ? "bg-destructive/10 text-destructive" :
                    a.type === "resolve" ? "bg-success/10 text-success" :
                    "bg-primary/10 text-primary"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
