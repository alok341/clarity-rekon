import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className = "" }: StatCardProps) {
  return (
    <div className={`stat-card animate-fade-in ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "status-badge status-pending",
    matched: "status-badge status-matched",
    discrepancy: "status-badge status-discrepancy",
    resolved: "status-badge status-resolved",
    unmatched: "status-badge status-pending",
  };
  return <span className={map[status] || "status-badge"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
