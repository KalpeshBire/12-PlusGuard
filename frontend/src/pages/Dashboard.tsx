import { useEffect, useState } from "react";
import { 
  Monitor, Activity, AlertTriangle, Clock, TrendingUp, Zap, 
  Globe, Plus, Pause, Download, RefreshCw, CheckCircle2, 
  ChevronRight, AlertCircle
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponseTimeChart } from "@/components/ResponseTimeChart";
import { UptimeRing } from "@/components/UptimeRing";
import { ResponseDistributionBar } from "@/components/ResponseDistributionBar";
import { dashboardApi, monitorsApi, exportsApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("24h");
  const [stats, setStats] = useState({
    totalMonitors: 0,
    activeMonitors: 0,
    downMonitors: 0,
    avgResponseTime: 0,
    uptimePercentage: 100,
    incidentsToday: 0,
    fastestResponse: 0,
    slowestResponse: 0,
    distribution: { fast: 0, average: 0, slow: 0 },
    incidentTimeline: [] as any[],
    lastAlert: "Monitoring stable"
  });
  
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardApi.getStats(timeRange) as any;
      if (data && data.stats) {
        setStats(prev => ({ ...prev, ...data.stats }));
      }
      if (data && data.statusLogs) {
        setLogs(data.statusLogs);
      }
      if (data && data.responseTimeData) {
         setChartData(data.responseTimeData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseAll = async () => {
    try {
      if (stats.activeMonitors > 0) {
        await monitorsApi.pauseAll();
        toast.success("All monitors have been paused", {
          description: "Monitoring checks will stop immediately."
        });
      } else {
        await monitorsApi.resumeAll();
        toast.success("Monitoring resumed", {
          description: "Resuming checks for all enabled services."
        });
      }
      await fetchDashboardData();
    } catch (error: any) {
      toast.error("Action failed", {
        description: error.message || "An error occurred while updating monitors."
      });
    }
  };

  const handleRecheck = async () => {
    try {
      toast.promise(dashboardApi.recheck(), {
        loading: 'Queuing checks...',
        success: () => {
          fetchDashboardData();
          return 'Checks queued successfully';
        },
        error: 'Failed to queue checks',
      });
    } catch (error) {
      console.error("Re-check Failed:", error);
    }
  };

  const handleExport = () => {
    toast.info("Preparing export...", {
      description: "Your log report is being generated."
    });
    const url = exportsApi.getLogsUrl();
    window.location.href = url;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Synchronizing dashboard...</p>
        </div>
      </div>
    );
  }

  const systemHealth = stats.downMonitors === 0 ? "All systems operational" : `${stats.downMonitors} monitor${stats.downMonitors > 1 ? 's' : ''} experiencing issues`;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 10. System Summary Message Box */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-3 px-5 rounded-xl border ${stats.downMonitors === 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${stats.downMonitors === 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
              {stats.downMonitors === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <span className={`text-sm font-semibold ${stats.downMonitors === 0 ? 'text-success' : 'text-danger'}`}>
              {stats.downMonitors === 0 ? "🎉 " : "⚠ "}{systemHealth}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/10">
              Live updates active
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">Command center for your global monitoring</p>
        </div>
        
        {/* 2. Time Filter Switch */}
        <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-lg border border-border/5">
          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                timeRange === range 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
          <button className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed">
            CUSTOM
          </button>
        </div>
      </div>

      {/* 1. System Health Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card flex items-center justify-between p-4 px-5">
           <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Incidents Today</p>
              <p className="text-xl font-bold text-foreground">{stats.incidentsToday || 0}</p>
           </div>
           <div className={`p-2 rounded-xl ${stats.incidentsToday > 0 ? 'bg-danger/20 text-danger' : 'bg-secondary/30 text-muted-foreground'}`}>
              <AlertCircle className="h-5 w-5" />
           </div>
        </div>
        <div className="glass-card flex items-center justify-between p-4 px-5">
           <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fastest Response</p>
              <p className="text-xl font-bold text-success">{stats.fastestResponse}ms</p>
           </div>
           <div className="p-2 rounded-xl bg-success/20 text-success">
              <Zap className="h-5 w-5" />
           </div>
        </div>
        <div className="glass-card flex items-center justify-between p-4 px-5">
           <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Slowest Response</p>
              <p className="text-xl font-bold text-warning">{stats.slowestResponse}ms</p>
           </div>
           <div className="p-2 rounded-xl bg-warning/20 text-warning">
              <TrendingUp className="h-5 w-5" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Monitors" value={stats.totalMonitors} icon={Monitor} />
        <StatsCard title="Active Status" value={stats.activeMonitors} icon={Activity} variant="success" trendUp />
        <StatsCard title="Current Downtime" value={stats.downMonitors} icon={AlertTriangle} variant="danger" />
        
        {/* 5. Uptime Progress Ring */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card flex items-center justify-between p-4 px-5 overflow-hidden relative group">
           <div className="space-y-1 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SLA Stability</p>
              <p className="text-2xl font-bold text-foreground">{stats.uptimePercentage}%</p>
              <p className="text-[10px] text-success font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Targets met
              </p>
           </div>
           <div className="relative z-10">
              <UptimeRing percentage={stats.uptimePercentage} size={70} strokeWidth={6} />
           </div>
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-16 w-16" />
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Main Chart Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                 <h3 className="text-sm font-bold text-foreground">Network Latency (ms)</h3>
               </div>
               <Select defaultValue="avg">
                 <SelectTrigger className="w-[120px] h-8 text-xs bg-secondary/20 border-border/10">
                   <SelectValue placeholder="Metric" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="avg">Average RT</SelectItem>
                   <SelectItem value="p95">P95 Latency</SelectItem>
                   <SelectItem value="p99">P99 Peak</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            {chartData.length > 0 ? (
              <ResponseTimeChart data={chartData} height={300} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground border border-dashed border-border/10 rounded-xl bg-secondary/5">
                  Analyzing network traffic...
              </div>
            )}
            
            {/* 3. Incident Timeline Section */}
            <div className="mt-8 pt-6 border-t border-border/10">
               <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Incident Progress Timeline</h4>
               <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                  {stats.incidentTimeline?.length > 0 ? stats.incidentTimeline.map((item: any, idx: number) => (
                    <div key={item.id} className="flex items-center shrink-0">
                       <div className="relative flex flex-col items-center group">
                          <div className={`h-4 w-4 rounded-full border-2 border-background ${item.status === 'UP' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                          <div className="absolute top-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center z-50 pointer-events-none">
                             <div className="bg-popover border border-border/50 p-2 rounded-lg shadow-2xl">
                                <p className="text-[10px] font-bold text-foreground">{item.monitorName}</p>
                                <p className="text-[9px] text-muted-foreground capitalize">{item.status === 'UP' ? 'Recovered' : 'Failure Detected'}</p>
                                <p className="text-[9px] font-mono mt-1">{item.timestamp}</p>
                             </div>
                          </div>
                       </div>
                       {idx < (stats.incidentTimeline?.length || 0) - 1 && (
                         <div className="w-16 h-[2px] bg-border/20 mx-1" />
                       )}
                    </div>
                  )) : (
                    <div className="flex items-center gap-3 py-2 opacity-50 italic text-xs text-muted-foreground">
                       <CheckCircle2 className="h-4 w-4 text-success" />
                       No critical incidents recorded in this timeframe.
                    </div>
                  )}
               </div>
            </div>
          </motion.div>

          {/* 8. Response Distribution Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="glass-card p-6">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-foreground">Quality Score Distribution</h3>
                  <div className="flex gap-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-success" />
                     <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                     <div className="h-1.5 w-1.5 rounded-full bg-danger" />
                  </div>
               </div>
               <ResponseDistributionBar data={stats.distribution} />
               <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-secondary/20 p-2 rounded-lg text-center">
                     <p className="text-[9px] text-muted-foreground font-bold uppercase">Great</p>
                     <p className="text-sm font-bold text-success">{stats.distribution?.fast || 0}</p>
                  </div>
                  <div className="bg-secondary/20 p-2 rounded-lg text-center">
                     <p className="text-[9px] text-muted-foreground font-bold uppercase">Fair</p>
                     <p className="text-sm font-bold text-warning">{stats.distribution?.average || 0}</p>
                  </div>
                  <div className="bg-secondary/20 p-2 rounded-lg text-center">
                     <p className="text-[9px] text-muted-foreground font-bold uppercase">Poor</p>
                     <p className="text-sm font-bold text-danger">{stats.distribution?.slow || 0}</p>
                  </div>
               </div>
            </motion.div>

            {/* 4. Status by Region */}
            <motion.div className="glass-card p-6">
               <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                 <Globe className="h-4 w-4 text-primary" /> Regional Edge Status
               </h3>
               <div className="space-y-4">
                  {[
                    { region: "India (Mumbai)", status: "Optimal", ping: "24ms" },
                    { region: "US East (Virginia)", status: "Optimal", ping: "142ms" },
                    { region: "Europe (Frankfurt)", status: "Optimal", ping: "89ms" },
                    { region: "Asia Pacific (Tokyo)", status: "Partial Degradation", ping: "312ms", warning: true }
                  ].map((loc) => (
                    <div key={loc.region} className="flex items-center justify-between group cursor-default">
                       <div className="flex items-center gap-3">
                          <div className={`h-1.5 w-1.5 rounded-full ${loc.warning ? 'bg-warning animate-pulse' : 'bg-success'}`} />
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{loc.region}</span>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground">{loc.ping}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* 7. Quick Actions Section */}
          <div className="glass-card p-5">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Management</h3>
             <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-none text-[11px] h-10 gap-2">
                   <Plus className="h-3 w-3" /> New
                </Button>
                <Button onClick={handlePauseAll} variant="secondary" size="sm" className="bg-secondary/40 text-foreground border-none text-[11px] h-10 gap-2">
                   <Pause className="h-3 w-3" /> {stats.activeMonitors > 0 ? 'Pause All' : 'Resume All'}
                </Button>
                <Button onClick={handleExport} variant="secondary" size="sm" className="bg-secondary/40 text-foreground border-none text-[11px] h-10 gap-2">
                   <Download className="h-3 w-3" /> Exports
                </Button>
                <Button onClick={handleRecheck} variant="secondary" size="sm" className="bg-secondary/40 text-foreground border-none text-[11px] h-10 gap-2">
                   <RefreshCw className="h-3 w-3" /> Re-check
                </Button>
             </div>
          </div>

          {/* 6. Smart Alerts Summary Widget */}
          <div className="glass-card p-5 border-l-4 border-l-primary">
             <div className="flex items-center gap-2 text-primary mb-3">
                <div className="relative">
                   <Activity className="h-4 w-4" />
                   <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest">Alerts Engine</h3>
             </div>
             <p className="text-sm font-medium text-foreground mb-1">State: Active</p>
             <p className="text-xs text-muted-foreground">Last dispatch: {stats.lastAlert}</p>
          </div>

          {/* 9. SLA Score Widget */}
          <div className="glass-card p-5 relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Service Reliability</h3>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-foreground">99.5%</span>
                   <span className="text-[10px] font-bold text-success uppercase tracking-tighter">Enterprise Standard</span>
                </div>
                <div className="mt-3 w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "99.5%" }} className="h-full bg-primary" />
                </div>
             </div>
             <TrendingUp className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5 group-hover:opacity-10 transition-opacity" />
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Feed</h3>
            <div className="space-y-4">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex gap-3 group cursor-default">
                  <div className={`mt-1 shrink-0 h-2 w-2 rounded-full ${log.status === 'up' ? 'bg-success' : 'bg-danger'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{log.monitorName}</p>
                    <p className="text-[10px] text-muted-foreground">{log.timestamp.split(", ")[1] || log.timestamp}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">Awaiting data logs...</p>
              )}
            </div>
            <Button variant="link" className="text-[10px] p-0 h-auto mt-4 text-primary font-bold uppercase tracking-wider">
               View Full Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

