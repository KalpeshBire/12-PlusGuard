import { useState, useEffect } from "react";
import { 
  Activity, Calendar, Clock, AlertTriangle, TrendingUp, Target, 
  ArrowDownCircle, ArrowUpCircle, AlertCircle, CheckCircle2, 
  Download, Share2, Info, Timer, Zap, ShieldCheck, Heart, Map, 
  ListChecks, History, Globe 
} from "lucide-react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts";
import { ResponseTimeChart } from "@/components/ResponseTimeChart";
import { UptimeChart } from "@/components/UptimeChart";
import { analyticsApi } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Heartbeat Strip component
const HeartbeatStrip = ({ data }: { data: number[] }) => {
  return (
    <div className="flex gap-1 h-8 items-end">
      {data.map((val, i) => (
        <div 
          key={i} 
          className={`w-2 rounded-full transition-all duration-500 ${val >= 99 ? 'bg-success h-full opacity-80' : val >= 95 ? 'bg-warning h-3/4' : 'bg-danger h-1/2'}`}
          title={`Day ${i+1}: ${val}%`}
        />
      ))}
    </div>
  );
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    slaStats: { current: 100, target: 99.9, trend: 0, totalUptime: "0h 0m", totalDowntime: "0h 0m", incidentCount: 0, mttr: "0m", mtbf: "N/A" },
    percentiles: { p50: 0, p90: 0, p99: 0 },
    insights: { commonFailure: 'Stable', peakDowntime: 'None', recoveryTrend: 'Steady' },
    responseTimeDistribution: [],
    incidentTimeline: [],
    downtimeEvents: [],
    responseTimeData: [],
    uptimeData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getStats(timeRange) as any;
        if (res && !res.error) {
          setData(prev => ({ ...prev, ...res }));
        }
      } catch (error) {
         console.error("Failed to fetch analytics:", error);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const { 
    slaStats = { current: 100, target: 99.9, trend: 0, totalUptime: "0h 0m", totalDowntime: "0h 0m", incidentCount: 0, mttr: "0m", mtbf: "N/A" }, 
    percentiles = { p50: 0, p90: 0, p99: 0 }, 
    insights = { commonFailure: 'Stable', peakDowntime: 'None', recoveryTrend: 'Steady' },
    responseTimeDistribution = [], 
    incidentTimeline = [], 
    downtimeEvents = [], 
    responseTimeData = [], 
    uptimeData = [] 
  } = (data || {}) as any;

  const slaColor = (slaStats?.current || 0) >= (slaStats?.target || 99.9) ? "text-success" : "text-danger";

  // Simulated 7-day heartbeat
  const heartbeatData = [100, 100, 99.8, 100, 98.5, 100, 100];

  const handleExport = (format: 'csv' | 'pdf') => {
     alert(`Exporting ${format.toUpperCase()} report...`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Activity className="h-8 w-8 text-primary animate-bounce" />
        <p className="text-muted-foreground animate-pulse">Computing analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep performance metrics and infrastructure health</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/30">
             <Button variant="ghost" size="sm" onClick={() => handleExport('csv')} className="h-8 text-xs gap-2">
                <Download className="h-3 w-3" /> CSV
             </Button>
             <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')} className="h-8 text-xs gap-2 border-l border-border/30 rounded-none">
                <Download className="h-3 w-3" /> PDF
             </Button>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-border/50">
              <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Summary Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-l-4 border-l-primary p-5 flex flex-col md:flex-row items-center gap-6 justify-between"
      >
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
           </div>
           <div>
              <h2 className="text-lg font-bold text-foreground">System Health Summary</h2>
              <p className="text-sm text-success flex items-center gap-1.5 font-medium">
                 <CheckCircle2 className="h-4 w-4" /> Service stable • {slaStats.incidentCount} incidents in {timeRange === '7d' ? 'last 7 days' : `last ${timeRange}`}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-8 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">7-Day Heartbeat</span>
              <HeartbeatStrip data={heartbeatData} />
           </div>
           <div className="h-10 w-px bg-border/50" />
           <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Avg Latency</span>
              <p className="text-xl font-bold text-foreground">{percentiles.p50}ms <span className="text-[10px] text-success font-medium">↓ 12%</span></p>
           </div>
        </div>
      </motion.div>

      {/* SLA Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Current SLA", value: `${slaStats.current}%`, icon: Target, color: slaColor, trend: slaStats.trend },
          { label: "Total Uptime", value: slaStats.totalUptime, icon: CheckCircle2, color: "text-success" },
          { label: "Total Downtime", value: slaStats.totalDowntime, icon: ArrowDownCircle, color: "text-danger" },
          { label: "MTBF", value: slaStats.mtbf, icon: Heart, color: "text-accent" },
          { label: "MTTR", value: slaStats.mttr, icon: Clock, color: "text-primary" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-4 relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between">
               <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
               {stat.trend !== undefined && (
                  <span className={`text-[10px] font-bold ${stat.trend >= 0 ? 'text-success' : 'text-danger'} flex items-center`}>
                     {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </span>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latency Percentiles Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card p-5 lg:col-span-1">
           <div className="flex items-center gap-2 mb-6">
              <Timer className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Latency Percentiles</h3>
           </div>
           <div className="space-y-4">
              {[
                { label: "P50", value: `${percentiles.p50}ms`, sub: "Median response", color: "bg-success" },
                { label: "P90", value: `${percentiles.p90}ms`, sub: "Slowest 10%", color: "bg-warning" },
                { label: "P99", value: `${percentiles.p99}ms`, sub: "Peak spikes", color: "bg-danger" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/10">
                   <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${p.color}`} />
                      <div>
                         <p className="text-xs font-bold text-foreground">{p.label}</p>
                         <p className="text-[10px] text-muted-foreground">{p.sub}</p>
                      </div>
                   </div>
                   <p className="text-sm font-bold text-foreground font-mono">{p.value}</p>
                </div>
              ))}
           </div>
           <div className="mt-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-primary/80 leading-relaxed italic">
                 "90% of your users experience a latency of less than {percentiles.p90}ms."
              </p>
           </div>
        </motion.div>

        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Response Time Trend</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-medium h-5">Real-time avg</Badge>
            </div>
            <ResponseTimeChart data={responseTimeData} height={200} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Uptime Heatmap</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-medium h-5">Target 99.9%</Badge>
            </div>
            <UptimeChart data={uptimeData} height={200} />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Root Cause Insights */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="glass-card p-5">
           <div className="flex items-center gap-2 mb-6">
              <Zap className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">Root Cause Insights</h3>
           </div>
           <div className="space-y-4">
              {[
                { label: "Most Common Failure", value: insights.commonFailure, icon: AlertCircle },
                { label: "Peak Downtime Hour", value: insights.peakDowntime, icon: Clock },
                { label: "Recovery Efficiency", value: insights.recoveryTrend, icon: TrendingUp },
              ].map((insight) => (
                <div key={insight.label} className="p-3 bg-secondary/30 rounded-xl border border-border/10">
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{insight.label}</p>
                   <div className="flex items-center gap-2">
                      <insight.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{insight.value}</span>
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Region Based Analytics */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card p-5">
           <div className="flex items-center gap-2 mb-6">
              <Map className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Response by Region</h3>
           </div>
           <div className="space-y-3">
              {[
                { region: "Asia Pacific (Mumbai)", latency: "420ms", status: "optimal" },
                { region: "US East (N. Virginia)", latency: "840ms", status: "good" },
                { region: "Europe (Frankfurt)", latency: "610ms", status: "optimal" },
                { region: "South America (São Paulo)", latency: "1.2s", status: "warning" },
              ].map((r) => (
                <div key={r.region} className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground">{r.region}</span>
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-foreground">{r.latency}</span>
                      <div className={`h-1.5 w-1.5 rounded-full ${r.status === 'optimal' ? 'bg-success' : r.status === 'good' ? 'bg-primary' : 'bg-warning'}`} />
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-8 h-24 bg-secondary/20 rounded-xl flex items-center justify-center border border-dashed border-border/50">
              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3" /> Global edge network active
              </p>
           </div>
        </motion.div>

        {/* Response Time Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="glass-card p-5">
           <div className="mb-6 flex items-center gap-2">
             <TrendingUp className="h-4 w-4 text-primary" />
             <h3 className="text-sm font-semibold text-foreground">Traffic Analysis</h3>
           </div>
           <ResponsiveContainer width="100%" height={180}>
             <BarChart data={responseTimeDistribution}>
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" vertical={false} />
               <XAxis dataKey="range" stroke="hsl(220, 10%, 40%)" tick={{ fontSize: 10 }} axisLine={false} />
               <YAxis hide />
               <Tooltip
                 contentStyle={{ backgroundColor: "hsl(220, 25%, 9%)", border: "1px solid hsl(220, 20%, 15%)", borderRadius: "8px" }}
                 itemStyle={{ fontSize: '10px' }}
               />
               <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
             </BarChart>
           </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Incident Timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-6">
             <History className="h-4 w-4 text-primary" />
             <h3 className="text-sm font-semibold text-foreground">Incident Timeline</h3>
          </div>
          <div className="relative space-y-0">
            {incidentTimeline.length > 0 ? incidentTimeline.map((incident, i) => {
              const Icon = incident.type === "down" ? ArrowDownCircle : incident.type === "resolved" ? ArrowUpCircle : AlertCircle;
              const color = incident.type === "down" ? "text-danger" : incident.type === "resolved" ? "text-success" : "text-warning";
              return (
                <div key={incident.id} className="flex gap-4 pb-6 relative">
                  {i < incidentTimeline.length - 1 && (
                    <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border/50" />
                  )}
                  <Icon className={`h-6 w-6 shrink-0 ${color} z-10 bg-background rounded-full`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                       <p className="text-sm font-bold text-foreground">{incident.monitorName}</p>
                       <span className="text-[10px] text-muted-foreground/60">{incident.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{incident.message}</p>
                    <Badge variant="outline" className="mt-2 text-[8px] h-4 tracking-tighter uppercase font-bold opacity-60">
                       Auto-Detection
                    </Badge>
                  </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center text-muted-foreground opacity-40">
                 <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                 <p className="text-xs">No incidents recorded in this period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Alert History Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="glass-card p-5">
           <div className="flex items-center gap-2 mb-6">
              <ListChecks className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">Alert Delivery History</h3>
           </div>
           <div className="space-y-4">
              {[
                { type: "Email", target: "admin@company.com", status: "delivered", time: "2h ago" },
                { type: "Telegram", target: "@pulseguard_bot", status: "delivered", time: "5h ago" },
                { type: "Webhook", target: "Discord API", status: "failed", time: "1d ago" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/10">
                   <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${alert.status === 'delivered' ? 'bg-success/10' : 'bg-danger/10'} flex items-center justify-center`}>
                         <Zap className={`h-3.5 w-3.5 ${alert.status === 'delivered' ? 'text-success' : 'text-danger'}`} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-foreground">{alert.type}</p>
                         <p className="text-[10px] text-muted-foreground">{alert.target}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <Badge variant="outline" className={`text-[8px] h-4 mb-1 ${alert.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                         {alert.status}
                      </Badge>
                      <p className="text-[9px] text-muted-foreground">{alert.time}</p>
                   </div>
                </div>
              ))}
           </div>
           <Button variant="link" className="text-xs text-primary mt-4 p-0 h-auto">View Alert Settings</Button>
        </motion.div>
      </div>

      {/* Downtime History Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="glass-card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-border/10">
          <h3 className="text-sm font-semibold text-foreground">Deep Downtime Audit</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">Raw Logs</Badge>
        </div>
        <div className="overflow-x-auto text-[13px]">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 text-muted-foreground text-left">
                <th className="px-5 py-3 font-bold truncate">Monitor</th>
                <th className="px-5 py-3 font-bold">Started</th>
                <th className="px-5 py-3 font-bold hidden sm:table-cell">Resolved</th>
                <th className="px-5 py-3 font-bold">Duration</th>
                <th className="px-5 py-3 font-bold hidden md:table-cell">Root Cause</th>
              </tr>
            </thead>
            <tbody>
              {downtimeEvents.length > 0 ? downtimeEvents.map((event) => (
                <tr key={event.id} className="border-b border-border/30 transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-4 font-bold text-foreground">{event.monitorName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{event.startedAt}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{event.endedAt}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-bold">
                      {event.duration}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                     <span className="flex items-center gap-1.5 underline decoration-dotted underline-offset-4 cursor-help" title="Remote peer closed the connection prematurely">
                        {event.reason}
                     </span>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-muted-foreground/40 italic">
                      Clean slate. No downtime events found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
