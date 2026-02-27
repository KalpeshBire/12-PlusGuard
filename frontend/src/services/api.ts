// API service layer - ready for backend integration
// Replace mock implementations with actual API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const headers = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: headers() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || `API Error: ${response.status}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || `API Error: ${response.status}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || `API Error: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.msg || `API Error: ${response.status}`);
    }
  },
};

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string }) => api.post("/auth/register", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
};

export const monitorsApi = {
  getAll: () => api.get("/monitors"),
  create: (data: unknown) => api.post("/monitors", data),
  update: (id: string, data: unknown) => api.put(`/monitors/${id}`, data),
  delete: (id: string) => api.delete(`/monitors/${id}`),
  pauseAll: () => api.post("/monitors/pause-all", {}),
  resumeAll: () => api.post("/monitors/resume-all", {}),
  recheck: (id: string) => api.post(`/monitors/${id}/recheck`, {}),
};

export const dashboardApi = {
  getStats: (timeRange: string = "24h") => api.get(`/dashboard?timeRange=${timeRange}`),
  recheck: () => api.post("/dashboard/recheck", {}),
};

export const analyticsApi = {
  getStats: (timeRange: string = "7d") => api.get(`/analytics?timeRange=${timeRange}`),
};

export const incidentsApi = {
  getAll: () => api.get<any[]>("/incidents"),
};

export const exportsApi = {
  getLogsUrl: () => `${API_BASE_URL}/exports/logs?token=${localStorage.getItem("token")}`,
};
