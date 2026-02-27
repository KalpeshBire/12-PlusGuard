import { useState, useEffect } from "react";
import { incidentsApi } from "@/services/api";
import { Activity, Search, Filter, CheckCircle2, AlertCircle, Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Incident {
  id: string;
  status: 'Resolved' | 'Unresolved';
  monitorName: string;
  rootCause: string;
  comments: number;
  started: string;
  resolved: string;
  duration: string;
  visibility: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const data = await incidentsApi.getAll();
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter(inc => 
    inc.monitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.rootCause.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header section matching UptimeRobot styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Incidents.</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by name or url" 
              className="pl-9 bg-[#1c1f26] border-border/10 text-sm h-9 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="bg-[#1c1f26] border-border/10 h-9 hidden sm:flex text-muted-foreground hover:text-foreground gap-2 rounded-md font-normal">
            <Filter className="h-3.5 w-3.5" /> All tags
          </Button>
          <Button variant="outline" size="sm" className="bg-[#1c1f26] border-border/10 h-9 hidden sm:flex text-muted-foreground hover:text-foreground gap-2 rounded-md font-normal">
            Started - Newe...
          </Button>
          <Button variant="outline" size="icon" className="bg-[#1c1f26] border-border/10 h-9 w-9 text-muted-foreground hover:text-foreground rounded-md">
            <Filter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="bg-[#1c1f26] border-border/10 h-9 w-9 text-muted-foreground hover:text-foreground rounded-md">
            <Share className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-[#241a5f] border border-[#3b2dc7] rounded-lg p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="bg-white/10 p-1 rounded-full h-fit mt-0.5">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Possible IP Allowlist Issue</h3>
            <p className="text-white/80 text-sm">
              If you're using a firewall, please ensure our new IPs are allowlisted to avoid potential monitoring issues. <span className="font-semibold underline cursor-pointer hover:text-white">Check IP list</span>
            </p>
          </div>
        </div>
        <button className="text-white/50 hover:text-white transition-colors">
          &times;
        </button>
      </div>

      {/* Incidents Table */}
      <div className="border border-border/10 rounded-lg bg-[#14161b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1c23] text-muted-foreground border-b border-border/10">
              <tr>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Status</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Monitor</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Root Cause</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Comments</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Started</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Resolved</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Duration</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap text-[13px]">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading incidents...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No incidents recorded yet.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-[#1a1d24] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 font-medium ${incident.status === 'Resolved' ? 'text-[#00c853]' : 'text-[#ff5252]'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                        {incident.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#d1d5db]">
                      {incident.monitorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#ff5252]/10 text-[#ff5252] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#ff5252]/20">
                           {incident.rootCause === 'Service Unavailable' ? '503' : '500'}
                        </span>
                        <span className="text-[#d1d5db] text-[13px]">{incident.rootCause}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#9ca3af]">
                      {incident.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#9ca3af] text-[13px]">
                      {incident.started.replace(',', '').replace('GMT+5:30', '')}
                      <br/>
                      <span className="text-[11px] text-muted-foreground/60">GMT+5:30</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#9ca3af] text-[13px]">
                      {incident.resolved !== '-' ? (
                        <>
                          {incident.resolved.replace(',', '').replace('GMT+5:30', '')}
                          <br/>
                          <span className="text-[11px] text-muted-foreground/60">GMT+5:30</span>
                        </>
                      ) : (
                         <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#9ca3af] text-[13px]">
                      {incident.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#d1d5db] text-[13px]">
                      {incident.visibility}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
