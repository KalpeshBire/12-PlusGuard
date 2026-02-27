import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "success" | "danger" | "warning";
}

const variantStyles = {
  default: "from-primary/10 to-transparent border-primary/10",
  success: "from-success/10 to-transparent border-success/10",
  danger: "from-danger/10 to-transparent border-danger/10",
  warning: "from-warning/10 to-transparent border-warning/10",
};

const iconStyles = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  danger: "text-danger bg-danger/10",
  warning: "text-warning bg-warning/10",
};

export function StatsCard({ title, value, icon: Icon, trend, trendUp, variant = "default" }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card-hover bg-gradient-to-br ${variantStyles[variant]} p-5`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trendUp ? "text-success" : "text-danger"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
