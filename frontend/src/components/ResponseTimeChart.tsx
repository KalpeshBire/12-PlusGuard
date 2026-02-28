import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { responseTimeData } from "@/data/mockData";

interface ResponseTimeChartProps {
  data?: typeof responseTimeData;
  height?: number;
}

export function ResponseTimeChart({ data = responseTimeData, height = 200 }: ResponseTimeChartProps) {
  // Extract monitor names from the first data point (excluding 'time')
  const getMonitorKeys = () => {
    if (!data || data.length === 0) return ["value"];
    const excludeKeys = ["time"];
    return Object.keys(data[0]).filter(key => !excludeKeys.includes(key));
  };

  const monitorKeys = getMonitorKeys();
  
  // Array of distinct colors for multiple lines
  const colors = [
    "hsl(152, 60%, 45%)", // Primary Green
    "hsl(217, 91%, 60%)", // Blue
    "hsl(35, 92%, 60%)",  // Orange
    "hsl(283, 39%, 53%)", // Purple
    "hsl(346, 87%, 60%)", // Pink
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {monitorKeys.map((key, index) => (
             <linearGradient key={`gradient-${key}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
               <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
             </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" />
        <XAxis dataKey="time" stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} minTickGap={30} />
        <YAxis stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 12 }} unit="ms" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220, 25%, 9%)",
            border: "1px solid hsl(220, 20%, 15%)",
            borderRadius: "8px",
            color: "hsl(220, 10%, 90%)",
          }}
          formatter={(value: number, name: string) => [`${value}ms`, name === 'value' ? 'Response Time' : name]}
        />
        {monitorKeys.map((key, index) => (
           <Area
             key={key}
             type="monotone"
             dataKey={key}
             stroke={colors[index % colors.length]}
             fill={`url(#gradient-${index})`}
             strokeWidth={2}
           />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
