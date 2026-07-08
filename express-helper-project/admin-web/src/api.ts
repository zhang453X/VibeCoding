import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username: string, password: string) =>
  instance.post("/auth/login", { username, password, role: "ADMIN" });
export const getUsers = (page?: number, size?: number) => instance.get("/admin/users", { params: { page, size } });
export const getPendingAuth = () => instance.get("/admin/auth/pending");
export const getAllAuth = (page?: number, size?: number) => instance.get("/admin/auth/all", { params: { page, size } });
export const approveAuth = (authId: number) => instance.post(`/admin/auth/${authId}/approve`);
export const rejectAuth = (authId: number, reason: string) =>
  instance.post(`/admin/auth/${authId}/reject`, null, { params: { reason } });
export const getAppeals = (params?: { page?: number; size?: number; status?: string; appealType?: string }) =>
  instance.get("/admin/appeals", { params });
export const resolveAppeal = (appealId: number, status: string, result: string) =>
  instance.post(`/admin/appeals/${appealId}/resolve`, null, { params: { status, result } });
export const getFeedbacks = (params?: { page?: number; size?: number; userId?: number | string; feedbackType?: string; status?: string }) =>
  instance.get("/admin/feedbacks", { params });
export const resolveFeedback = (feedbackId: number, reply: string) =>
  instance.post(`/admin/feedbacks/${feedbackId}/resolve`, null, { params: { reply } });
export const getConfigs = () => instance.get("/admin/configs");
export const saveConfig = (payload: { id?: number; configKey: string; configValue: string; configDesc?: string; enabled?: number }) =>
  instance.post("/admin/configs", payload);
export const deleteConfig = (id: number) => instance.delete(`/admin/configs/${id}`);
export const getStations = () => instance.get("/admin/stations");
export const saveStation = (payload: any) => instance.post("/admin/stations", payload);
export const deleteStation = (id: number) => instance.delete(`/admin/stations/${id}`);
export const getOrders = (status?: string, page?: number, size?: number) => instance.get("/admin/orders", { params: { status, page, size } });
export const forceCancelOrder = (orderId: number, reason: string) =>
  instance.post(`/admin/orders/${orderId}/force-cancel`, null, { params: { reason } });
export const getDashboard = () => instance.get("/admin/dashboard");
export const freezeUser = (userId: number, freezeStatus: number) =>
  instance.post(`/admin/users/${userId}/freeze`, null, { params: { freezeStatus } });
export const updateUser = (userId: number, data: any) =>
  instance.put(`/admin/users/${userId}`, data);
export const toggleCourier = (userId: number, enabled: number) =>
  instance.post(`/admin/users/${userId}/courier`, null, { params: { enabled } });
export const resetPassword = (userId: number) =>
  instance.post(`/admin/users/${userId}/reset-password`);
export const exportOrders = (status?: string) =>
  instance.get("/admin/orders/export", { params: { status }, responseType: "blob" });
