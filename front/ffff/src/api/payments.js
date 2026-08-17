import { request } from "./client";

// ⚠️ These routes were never wired into a frontend before — verify each one
// against your PaymentController. Shapes match the DTOs discussed while
// building the backend (CreatePayment / Confirmed / Failed / GetPaymentById).
export const PaymentApi = {
  create: (orderId, method) => request("/Payment", { method: "POST", body: { orderId, method }, auth: true }),
  confirm: (paymentId, transactionId) =>
    request(`/Payment/${paymentId}/confirmed`, { method: "POST", body: { transactionId }, auth: true }),
  fail: (paymentId) => request(`/Payment/${paymentId}/failed`, { method: "POST", auth: true }),
  getByOrder: (orderId) => request(`/Payment/order/${orderId}`, { auth: true }),
};
