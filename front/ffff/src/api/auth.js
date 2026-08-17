import { request, setToken, clearToken } from "./client";

export const AuthApi = {
  register: (dto) => request("/Auth/register", { method: "POST", body: dto }),
  login: (dto) => request("/Auth/login", { method: "POST", body: dto }),

  requestSeller: () => request("/Auth/request-seller", { method: "POST", auth: true }),
  getSellerRequests: () => request("/Auth/seller-requests", { auth: true }),
  approveSellerRequest: (id) => request(`/Auth/seller-requests/${id}/approve`, { method: "POST", auth: true }),
  rejectSellerRequest: (id) => request(`/Auth/seller-requests/${id}/reject`, { method: "POST", auth: true }),
};

export function persistSession(token) {
  setToken(token);
}
export function clearSession() {
  clearToken();
}
