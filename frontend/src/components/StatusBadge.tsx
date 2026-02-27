import { type MonitorStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: MonitorStatus;
  showDot?: boolean;
  size?: "sm" | "md";
}

const statusConfig = {
  up: { label: "Up", className: "status-up" },
  down: { label: "Down", className: "status-down" },
  warning: { label: "Warning", className: "status-warning" },
};

export function StatusBadge({ status, showDot = true, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${status === "up" ? "bg-success" : status === "down" ? "bg-danger" : "bg-warning"}`} />
      )}
      {config.label}
    </span>
  );
}
