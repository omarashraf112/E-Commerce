import { request } from "./client";
import { MOCK_REVIEWS } from "@/data/mockStoreData";

export const ReviewApi = {
  getByProduct: async (productId) => {
    try {
      const data = await request(`/Review/${productId}`);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
    return MOCK_REVIEWS;
  },
  create: (productId, rating, comment) =>
    request("/Review", { method: "POST", body: { productId, rating, comment }, auth: true }),
  update: (reviewId, rating, comment) =>
    request(`/Review/${reviewId}`, { method: "PATCH", body: { rating, comment }, auth: true }),
  remove: (reviewId) => request(`/Review/${reviewId}`, { method: "DELETE", auth: true }),
};
