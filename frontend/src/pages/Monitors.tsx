import { useState, useEffect } from "react";
import { Plus, Pencil, Pause, Play, Trash2, Globe, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle, XCircle, MoreVertical, LayoutGrid, List as ListIcon, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { AddMonitorModal } from "@/components/AddMonitorModal";
import { monitorsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast as toastSonner } from "sonner";

// Simple Sparkline component using SVG
const MiniSparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length < 2) return <div className="h-6 w-16 bg-secondary/20 rounded animate-pulse" />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 64;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-primary opacity-70"
      />
    </svg>
  );
};

export default function Monitors() {
  const [modalOpen, setModalOpen] = useState(false);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [filteredMonitors, setFilteredMonitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const { toast } = useToast();

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'up').length,
    down: monitors.filter(m => m.status === 'down').length,
    paused: monitors.filter(m => !m.enabled).length
  };

  const fetchMonitors = async () => {
    try {
      setIsLoading(true);
      const data = await monitorsApi.getAll();
      setMonitors(data as any[]);
    } catch (error: any) {
      toast({
        title: "Error fetching monitors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  useEffect(() => {
    let result = monitors;

    if (searchQuery) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(m => m.status === statusFilter);
    }

    setFilteredMonitors(result);
  }, [monitors, searchQuery, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      await monitorsApi.delete(id);
      toast({ title: "Success", description: "Monitor deleted" });
      fetchMonitors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (monitor: any) => {
    try {
      await monitorsApi.update(monitor.id, { enabled: !monitor.enabled });
      toastSonner.success(`Monitor ${monitor.enabled ? 'paused' : 'resumed'}`);
      fetchMonitors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRecheck = async (id: string, name: string) => {
    try {
      await monitorsApi.recheck(id);
      toastSonner.success(`Checking ${name} now...`);
      fetchMonitors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedMonitors.length) return;
    if (!confirm(`Delete ${selectedMonitors.length} monitors?`)) return;
    
    try {
      await Promise.all(selectedMonitors.map(id => monitorsApi.delete(id)));
      toastSonner.success(`Deleted ${selectedMonitors.length} monitors`);
      setSelectedMonitors([]);
      fetchMonitors();
    } catch (error: any) {
      toast({ title: "Bulk Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedMonitors.length === filteredMonitors.length) {
      setSelectedMonitors([]);
    } else {
      setSelectedMonitors(filteredMonitors.map(m => m.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedMonitors(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Monitors</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">Real-time status tracking for your infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={fetchMonitors} className="gap-2 h-10 px-4">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync
           </Button>
           <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-4">
              <Plus className="h-4 w-4" /> Add Monitor
           </Button>
        </div>
      </div>

      {/* Quick Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Healthy", value: stats.up, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
          { label: "Critical", value: stats.down, icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
          { label: "Paused", value: stats.paused, icon: Pause, color: "text-muted-foreground", bg: "bg-secondary/50" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search + Filter Bar */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by URL or name..." 
                className="pl-10 h-10 bg-secondary/30 border-none ring-offset-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 bg-secondary/30 border-none">
                 <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Statuses</SelectItem>
                 <SelectItem value="up">Online</SelectItem>
                 <SelectItem value="down">Offline</SelectItem>
                 <SelectItem value="warning">Pending</SelectItem>
              </SelectContent>
           </Select>
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedMonitors.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 p-1 bg-primary/10 rounded-lg border border-primary/20"
            >
               <span className="text-xs font-bold px-3 text-primary">{selectedMonitors.length} selected</span>
               <div className="h-4 w-px bg-primary/20" />
               <Button onClick={handleBulkDelete} variant="ghost" size="sm" className="h-8 text-xs text-danger hover:bg-danger/10 gap-2">
                  <Trash2 className="h-3 w-3" /> Delete
               </Button>
               <Button onClick={() => setSelectedMonitors([])} variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                  Cancel
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="px-5 py-3.5 text-left w-10">
                   <Checkbox 
                     checked={selectedMonitors.length === filteredMonitors.length && filteredMonitors.length > 0} 
                     onCheckedChange={toggleSelectAll}
                   />
                </th>
                <th className="px-5 py-3.5 text-left font-medium">Website</th>
                <th className="px-5 py-3.5 text-left font-medium">Status / SLA</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Region</th>
                <th className="px-5 py-3.5 text-left font-medium hidden md:table-cell">Perf.</th>
                <th className="px-5 py-3.5 text-left font-medium hidden sm:table-cell">Last Update</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonitors.map((monitor) => (
                <tr key={monitor.id} className={`border-b border-border/30 transition-colors hover:bg-secondary/20 ${selectedMonitors.includes(monitor.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-5 py-3.5">
                     <Checkbox 
                       checked={selectedMonitors.includes(monitor.id)} 
                       onCheckedChange={() => toggleSelect(monitor.id)}
                     />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${monitor.status === 'down' ? 'bg-danger/10' : 'bg-secondary/50'}`}>
                        <Globe className={`h-4 w-4 ${monitor.status === 'down' ? 'text-danger' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{monitor.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">{monitor.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                     <div className="flex flex-col gap-1">
                        <StatusBadge status={monitor.status} />
                        <span className={`text-[10px] font-bold ${Number(monitor.uptime) >= 99.9 ? 'text-success' : 'text-warning'}`}>
                           SLA: {monitor.uptime}%
                        </span>
                     </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                     <div className="flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">Global Edges</span>
                     </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                         <MiniSparkline data={monitor.sparkline || []} />
                         <span className="text-[10px] text-muted-foreground font-medium">{monitor.responseTime}ms avg</span>
                      </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                     <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{new Date(monitor.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {monitor.incidents24h > 0 && (
                          <Badge variant="outline" className="mt-1 bg-danger/5 text-danger border-danger/20 text-[9px] h-4">
                             {monitor.incidents24h} Incidents (24h)
                          </Badge>
                        )}
                     </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Switch 
                        checked={monitor.enabled} 
                        onCheckedChange={() => handleToggleStatus(monitor)}
                        className="scale-75 data-[state=checked]:bg-success"
                      />
                      <div className="h-4 w-px bg-border/50 mx-1" />
                      <Button onClick={() => handleRecheck(monitor.id, monitor.name)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors tooltip" title="Run check now">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleDelete(monitor.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMonitors.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                     <div className="flex flex-col items-center gap-3 opacity-40">
                        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">No monitors found matching your criteria</p>
                        <Button variant="link" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>Clear filters</Button>
                     </div>
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-20 animate-pulse">
                     <p className="text-sm text-muted-foreground">Synchronizing monitor states...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AddMonitorModal open={modalOpen} onOpenChange={setModalOpen} onAdded={fetchMonitors} />
    </div>
  );
}
