import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { responseTimeData } from "@/data/mockData";

interface ResponseTimeChartProps {
  data?: typeof responseTimeData;
  height?: number;
}

export function ResponseTimeChart({ data = responseTimeData, height = 200 }: ResponseTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" />
        <XAxis dataKey="time" stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} />
        <YAxis stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} unit="ms" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220, 25%, 9%)",
            border: "1px solid hsl(220, 20%, 15%)",
            borderRadius: "8px",
            color: "hsl(220, 10%, 90%)",
          }}
          formatter={(value: number) => [`${value}ms`, "Response Time"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(152, 60%, 45%)"
          fill="url(#responseGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
