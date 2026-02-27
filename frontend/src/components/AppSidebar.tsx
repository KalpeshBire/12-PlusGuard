import { 
  LayoutDashboard, Monitor, BarChart3, Settings, 
  Activity, AlertTriangle, CreditCard, ChevronLeft, 
  ChevronRight, Sparkles 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { monitorsApi, incidentsApi } from "@/services/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Monitors", url: "/monitors", icon: Monitor },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Incidents", url: "/incidents", icon: AlertTriangle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [hasIncidents, setHasIncidents] = useState(false);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const monitors = await monitorsApi.getAll() as any[];
        setStats({ total: monitors.length, active: monitors.filter(m => m.status === 'UP').length });
        
        const incidents = await incidentsApi.getAll() as any[];
        setHasIncidents(incidents.some(i => !i.resolvedAt));
      } catch (error) {
        console.error("Sidebar data fetch failed:", error);
      }
    };
    fetchSidebarData();
    const interval = setInterval(fetchSidebarData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="icon" className="sidebar-glass border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center justify-between group/header">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full opacity-0 group-hover/header:opacity-100 transition-opacity" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-black tracking-tight text-foreground uppercase leading-tight">
                  PulseGuard
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Sparkles className="h-2 w-2 text-primary" /> Monitoring Simplified
                </span>
              </motion.div>
            )}
          </div>
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="h-7 w-7 opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                const showBadge = item.title === "Incidents" && hasIncidents;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="group/item relative h-10 overflow-hidden"
                    >
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300",
                          isActive 
                            ? "nav-item-active text-primary" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <motion.div
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="relative flex items-center justify-center"
                        >
                          <item.icon className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-transform duration-300",
                            isActive ? "scale-110" : "group-hover/item:scale-110"
                          )} />
                          {showBadge && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(var(--danger),0.8)]" />
                          )}
                        </motion.div>
                        {!collapsed && (
                          <span className="text-sm font-medium tracking-wide">
                            {item.title}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute inset-0 bg-primary/5 rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="py-6 px-4 bg-gradient-to-t from-sidebar-accent/50 to-transparent">
          <div className="glass-card p-4 space-y-3 bg-sidebar-accent/30 border-sidebar-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
                  <CreditCard className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-foreground">Free Plan</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{stats.total} / Unlimited</span>
            </div>
            
            <div className="space-y-1.5">
              <Progress value={0} className="h-1.5 bg-sidebar-background overflow-hidden" />
              <div className="flex justify-between text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                <span>Usage</span>
                <span>Active</span>
              </div>
            </div>

            <Button className="w-full h-8 text-[11px] font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              Upgrade to Pro
            </Button>
          </div>
        </SidebarFooter>
      )}
      {collapsed && (
        <SidebarFooter className="p-4 flex justify-center border-t border-sidebar-border/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-bold">Free Plan ({stats.total}/Unlimited)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
