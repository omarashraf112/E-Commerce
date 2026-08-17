import { request } from "./client";

export const OrderApi = {
  checkout: (address) => request("/Order/checkout", { method: "POST", auth: true, query: { Address: address } }),

  getMyOrders: () => request("/Order/summary", { auth: true }),

  getDetails: (orderId) => request("/Order/details", { auth: true, query: { orderId } }),

  // Named "delete" on the backend but it's a soft cancel (Status -> Cancelled), not a hard delete.
  cancel: (orderId) => request("/Order/delete", { method: "PATCH", auth: true, query: { orderId } }),

  updateStatus: (orderId, status) =>
    request("/Order/status", { method: "PATCH", auth: true, query: { orderId, status } }),

  // Admin only — bare GET /Order (no query params) returns every order in the system.
  getAll: () => request("/Order", { auth: true }),
};
