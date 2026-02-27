import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { uptimeData } from "@/data/mockData";

interface UptimeChartProps {
  data?: typeof uptimeData;
  height?: number;
}

export function UptimeChart({ data = uptimeData, height = 200 }: UptimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(175, 55%, 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(175, 55%, 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" />
        <XAxis dataKey="date" stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} />
        <YAxis stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} domain={[94, 100]} unit="%" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220, 25%, 9%)",
            border: "1px solid hsl(220, 20%, 15%)",
            borderRadius: "8px",
            color: "hsl(220, 10%, 90%)",
          }}
          formatter={(value: number) => [`${value}%`, "Uptime"]}
        />
        <Area
          type="monotone"
          dataKey="uptime"
          stroke="hsl(175, 55%, 45%)"
          fill="url(#uptimeGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
