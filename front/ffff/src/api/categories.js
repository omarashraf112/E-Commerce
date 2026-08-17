import { request } from "./client";
import { MOCK_CATEGORIES } from "@/data/mockStoreData";

export const CategoryApi = {
  getAll: async () => {
    try {
      const data = await request("/Category");
      if (Array.isArray(data) && data.length > 0) return data;
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },
  create: (dto) => request("/Category", { method: "POST", body: dto, auth: true }),
  remove: (id) => request(`/Category/${id}`, { method: "DELETE", auth: true }),
};
