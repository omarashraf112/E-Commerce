import { request } from "./client";

// Base route is /Cart. GET is /Cart/User/{userId} but the {userId} segment is
// ignored server-side (the backend reads the user from the JWT claim instead)
// — any placeholder value works, so we pass "me" for readability.
export const CartApi = {
  get: () => request("/Cart/User/me", { auth: true }),

  add: (productId, quantity) =>
    request("/Cart", { method: "POST", body: { productId, quantity }, auth: true }),

  updateQuantity: (cartItemId, newQuantity) =>
    request("/Cart", { method: "PATCH", auth: true, query: { cartItemId, newQuantity } }),

  // ⚠️ Verify these two against your CartController — not confirmed during
  // the original build, matching the PDF's planned shape as a best guess.
  removeItem: (cartItemId) => request(`/Cart/item/${cartItemId}`, { method: "DELETE", auth: true }),
  clear: () => request("/Cart", { method: "DELETE", auth: true }),
};
