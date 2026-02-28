import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { uptimeData } from "@/data/mockData";

interface UptimeChartProps {
  data?: typeof uptimeData;
  height?: number;
}

export function UptimeChart({ data = uptimeData, height = 200 }: UptimeChartProps) {
  // Extract monitor names from the first data point (excluding 'date')
  const getMonitorKeys = () => {
    if (!data || data.length === 0) return ["uptime"];
    const excludeKeys = ["date"];
    return Object.keys(data[0]).filter(key => !excludeKeys.includes(key));
  };

  const monitorKeys = getMonitorKeys();
  
  // Array of distinct colors for multiple lines
  const colors = [
    "hsl(175, 55%, 45%)", // Primary Teal
    "hsl(43, 96%, 56%)",  // Yellow
    "hsl(333, 71%, 51%)", // Rose
    "hsl(199, 89%, 48%)", // Light Blue
    "hsl(262, 83%, 58%)", // Violet
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {monitorKeys.map((key, index) => (
             <linearGradient key={`grad-${key}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
               <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
             </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" />
        <XAxis dataKey="date" stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} minTickGap={30} />
        <YAxis stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} domain={[94, 100]} unit="%" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220, 25%, 9%)",
            border: "1px solid hsl(220, 20%, 15%)",
            borderRadius: "8px",
            color: "hsl(220, 10%, 90%)",
          }}
          formatter={(value: number, name: string) => [`${value}%`, name === 'uptime' ? 'Uptime' : name]}
        />
        {monitorKeys.map((key, index) => (
           <Area
             key={key}
             type="monotone"
             dataKey={key}
             stroke={colors[index % colors.length]}
             fill={`url(#grad-${index})`}
             strokeWidth={2}
           />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
