export type MonitorStatus = "up" | "down" | "warning";

export interface Monitor {
  id: string;
  url: string;
  name: string;
  status: MonitorStatus;
  interval: number;
  lastChecked: string;
  uptime: number;
  responseTime: number;
  alertEmail: string;
  enabled: boolean;
  httpMethod: "GET" | "POST" | "HEAD" | "PUT" | "DELETE";
  customHeaders: string;
  timeout: number;
  expectedStatusCode: number;
  keywordCheck: string;
}

export interface StatusLog {
  id: string;
  monitorName: string;
  url: string;
  status: MonitorStatus;
  responseTime: number;
  timestamp: string;
  statusCode: number;
}

export interface ResponseTimePoint {
  time: string;
  value: number;
}

export interface UptimePoint {
  date: string;
  uptime: number;
}

export interface DowntimeEvent {
  id: string;
  monitorName: string;
  startedAt: string;
  endedAt: string | null;
  duration: string;
  reason: string;
}

export const monitors: Monitor[] = [
  { id: "1", url: "https://myapp.com", name: "My App", status: "up", interval: 5, lastChecked: "2 min ago", uptime: 99.98, responseTime: 142, alertEmail: "admin@myapp.com", enabled: true, httpMethod: "GET", customHeaders: "", timeout: 30, expectedStatusCode: 200, keywordCheck: "" },
  { id: "2", url: "https://api.myapp.com", name: "API Server", status: "up", interval: 3, lastChecked: "1 min ago", uptime: 99.95, responseTime: 89, alertEmail: "admin@myapp.com", enabled: true, httpMethod: "GET", customHeaders: '{"Authorization": "Bearer token"}', timeout: 15, expectedStatusCode: 200, keywordCheck: "" },
  { id: "3", url: "https://blog.myapp.com", name: "Blog", status: "warning", interval: 10, lastChecked: "5 min ago", uptime: 98.50, responseTime: 890, alertEmail: "admin@myapp.com", enabled: true, httpMethod: "GET", customHeaders: "", timeout: 30, expectedStatusCode: 200, keywordCheck: "Welcome" },
  { id: "4", url: "https://shop.myapp.com", name: "Shop", status: "down", interval: 3, lastChecked: "1 min ago", uptime: 95.20, responseTime: 0, alertEmail: "admin@myapp.com", enabled: true, httpMethod: "HEAD", customHeaders: "", timeout: 10, expectedStatusCode: 200, keywordCheck: "" },
  { id: "5", url: "https://docs.myapp.com", name: "Documentation", status: "up", interval: 15, lastChecked: "10 min ago", uptime: 99.99, responseTime: 210, alertEmail: "admin@myapp.com", enabled: true, httpMethod: "GET", customHeaders: "", timeout: 30, expectedStatusCode: 200, keywordCheck: "documentation" },
  { id: "6", url: "https://staging.myapp.com", name: "Staging", status: "up", interval: 5, lastChecked: "3 min ago", uptime: 99.80, responseTime: 320, alertEmail: "dev@myapp.com", enabled: false, httpMethod: "POST", customHeaders: '{"Content-Type": "application/json"}', timeout: 20, expectedStatusCode: 201, keywordCheck: "" },
];

export const responseTimeDistribution = [
  { range: "0-100ms", count: 45 },
  { range: "100-200ms", count: 120 },
  { range: "200-500ms", count: 65 },
  { range: "500ms-1s", count: 18 },
  { range: "1s+", count: 5 },
];

export const incidentTimeline = [
  { id: "1", type: "down" as const, monitorName: "Shop", message: "Site went down - 503 Service Unavailable", timestamp: "Jan 15, 14:25", resolved: false },
  { id: "2", type: "resolved" as const, monitorName: "Blog", message: "High response time resolved after 1h 33m", timestamp: "Jan 13, 09:45", resolved: true },
  { id: "3", type: "warning" as const, monitorName: "Blog", message: "Response time exceeded 800ms threshold", timestamp: "Jan 13, 08:12", resolved: true },
  { id: "4", type: "resolved" as const, monitorName: "API Server", message: "Connection timeout resolved after 8m", timestamp: "Jan 10, 03:28", resolved: true },
  { id: "5", type: "down" as const, monitorName: "API Server", message: "Connection timeout detected", timestamp: "Jan 10, 03:20", resolved: true },
  { id: "6", type: "resolved" as const, monitorName: "My App", message: "SSL certificate error resolved after 45m", timestamp: "Jan 5, 16:45", resolved: true },
  { id: "7", type: "down" as const, monitorName: "My App", message: "SSL certificate error detected", timestamp: "Jan 5, 16:00", resolved: true },
];

export const slaStats = {
  current: 99.12,
  target: 99.9,
  totalUptime: "14d 23h 47m",
  totalDowntime: "1h 33m",
  incidentCount: 4,
  mttr: "24m",
};

export const statusLogs: StatusLog[] = [
  { id: "1", monitorName: "My App", url: "https://myapp.com", status: "up", responseTime: 142, timestamp: "2024-01-15 14:32:00", statusCode: 200 },
  { id: "2", monitorName: "API Server", url: "https://api.myapp.com", status: "up", responseTime: 89, timestamp: "2024-01-15 14:31:00", statusCode: 200 },
  { id: "3", monitorName: "Blog", url: "https://blog.myapp.com", status: "warning", responseTime: 890, timestamp: "2024-01-15 14:30:00", statusCode: 200 },
  { id: "4", monitorName: "Shop", url: "https://shop.myapp.com", status: "down", responseTime: 0, timestamp: "2024-01-15 14:29:00", statusCode: 503 },
  { id: "5", monitorName: "My App", url: "https://myapp.com", status: "up", responseTime: 138, timestamp: "2024-01-15 14:28:00", statusCode: 200 },
  { id: "6", monitorName: "Documentation", url: "https://docs.myapp.com", status: "up", responseTime: 210, timestamp: "2024-01-15 14:27:00", statusCode: 200 },
  { id: "7", monitorName: "Shop", url: "https://shop.myapp.com", status: "down", responseTime: 0, timestamp: "2024-01-15 14:25:00", statusCode: 503 },
  { id: "8", monitorName: "API Server", url: "https://api.myapp.com", status: "up", responseTime: 92, timestamp: "2024-01-15 14:24:00", statusCode: 200 },
];

export const responseTimeData: ResponseTimePoint[] = [
  { time: "00:00", value: 145 }, { time: "02:00", value: 132 }, { time: "04:00", value: 128 },
  { time: "06:00", value: 155 }, { time: "08:00", value: 190 }, { time: "10:00", value: 210 },
  { time: "12:00", value: 185 }, { time: "14:00", value: 142 }, { time: "16:00", value: 168 },
  { time: "18:00", value: 195 }, { time: "20:00", value: 175 }, { time: "22:00", value: 138 },
];

export const uptimeData: UptimePoint[] = [
  { date: "Jan 1", uptime: 99.9 }, { date: "Jan 2", uptime: 100 }, { date: "Jan 3", uptime: 99.8 },
  { date: "Jan 4", uptime: 99.95 }, { date: "Jan 5", uptime: 98.5 }, { date: "Jan 6", uptime: 99.99 },
  { date: "Jan 7", uptime: 100 }, { date: "Jan 8", uptime: 99.7 }, { date: "Jan 9", uptime: 99.9 },
  { date: "Jan 10", uptime: 100 }, { date: "Jan 11", uptime: 99.85 }, { date: "Jan 12", uptime: 99.95 },
  { date: "Jan 13", uptime: 95.2 }, { date: "Jan 14", uptime: 99.9 }, { date: "Jan 15", uptime: 99.98 },
];

export const downtimeEvents: DowntimeEvent[] = [
  { id: "1", monitorName: "Shop", startedAt: "Jan 15, 14:25", endedAt: null, duration: "Ongoing", reason: "503 Service Unavailable" },
  { id: "2", monitorName: "Blog", startedAt: "Jan 13, 08:12", endedAt: "Jan 13, 09:45", duration: "1h 33m", reason: "High response time" },
  { id: "3", monitorName: "API Server", startedAt: "Jan 10, 03:20", endedAt: "Jan 10, 03:28", duration: "8m", reason: "Connection timeout" },
  { id: "4", monitorName: "My App", startedAt: "Jan 5, 16:00", endedAt: "Jan 5, 16:45", duration: "45m", reason: "SSL certificate error" },
];

export const dashboardStats = {
  totalMonitors: 6,
  activeMonitors: 5,
  downMonitors: 1,
  avgResponseTime: 185,
  uptimePercentage: 99.12,
};
