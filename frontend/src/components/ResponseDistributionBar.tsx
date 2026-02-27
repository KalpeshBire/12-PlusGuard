import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

interface ResponseDistributionBarProps {
  data: {
    fast: number;
    average: number;
    slow: number;
  };
  height?: number;
}

export function ResponseDistributionBar({ data, height = 200 }: ResponseDistributionBarProps) {
  const chartData = [
    { name: "0-500ms", value: data?.fast || 0, color: "hsl(142, 70%, 45%)" },
    { name: "500-1000ms", value: data?.average || 0, color: "hsl(35, 90%, 50%)" },
    { name: "1000ms+", value: data?.slow || 0, color: "hsl(0, 84%, 60%)" }
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          stroke="hsl(220, 10%, 40%)" 
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            backgroundColor: "hsl(220, 25%, 9%)",
            border: "1px solid hsl(220, 20%, 15%)",
            borderRadius: "8px",
            color: "hsl(220, 10%, 90%)",
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
