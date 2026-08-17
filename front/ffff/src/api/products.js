import { request, requestForm } from "./client";
import { MOCK_PRODUCTS } from "@/data/mockStoreData";

export const ProductApi = {
  getAll: async (filter = {}) => {
    try {
      const data = await request("/Product", {
        query: {
          Search: filter.search,
          CategoryId: filter.categoryId,
          MinPrice: filter.minPrice,
          MaxPrice: filter.maxPrice,
          SortBy: filter.sortBy,
          SortOrder: filter.sortOrder,
          Page: filter.page || 1,
          PageSize: filter.pageSize || 12,
        },
      });
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fall back to memory dataset if backend is unreachable
    }

    // In-memory filter logic for mock data
    let list = [...MOCK_PRODUCTS];

    if (filter.categoryId) {
      list = list.filter((p) => String(p.categoryId) === String(filter.categoryId));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    if (filter.minPrice !== undefined && filter.minPrice !== "") {
      list = list.filter((p) => p.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice !== undefined && filter.maxPrice !== "") {
      list = list.filter((p) => p.price <= Number(filter.maxPrice));
    }

    if (filter.sortBy === "price") {
      list.sort((a, b) => (filter.sortOrder === "desc" ? b.price - a.price : a.price - b.price));
    } else if (filter.sortBy === "rating") {
      list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (filter.sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    const page = Number(filter.page || 1);
    const pageSize = Number(filter.pageSize || 12);
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  },

  getById: async (id) => {
    try {
      const data = await request(`/Product/${id}`);
      if (data) return data;
    } catch {
      // Fallback
    }
    const found = MOCK_PRODUCTS.find((p) => String(p.id) === String(id));
    return found || MOCK_PRODUCTS[0];
  },

  getByCategory: async (categoryId) => {
    try {
      const data = await request(`/Product/category/${categoryId}`);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
    return MOCK_PRODUCTS.filter((p) => String(p.categoryId) === String(categoryId));
  },

  create: (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) fd.append(key, value);
    });
    return requestForm("/Product", { method: "POST", formData: fd, auth: true });
  },

  update: (id, dto) => request(`/Product/${id}`, { method: "PUT", body: dto, auth: true }),
  remove: (id) => request(`/Product/${id}`, { method: "DELETE", auth: true }),
};
