// ============================================================
// API layer — one function per backend endpoint.
// Nothing in here touches the DOM.
// ============================================================

const Api = (() => {
  function authHeaders(extra = {}) {
    const token = Store.getToken();
    return token
      ? { ...extra, Authorization: `Bearer ${token}` }
      : { ...extra };
  }

  async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
    const headers = {};
    if (!isForm) headers["Content-Type"] = "application/json";
    const finalHeaders = auth ? authHeaders(headers) : headers;

    let res;
    try {
      res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
        method,
        headers: finalHeaders,
        body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new ApiError(
        0,
        "Can't reach the server. Check that the backend is running and CONFIG.API_BASE_URL is correct (and CORS is enabled)."
      );
    }

    if (res.status === 401) {
      Store.clearAuth();
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      let msg =
        (data && (data.message || data.title || data.error)) ||
        `Request failed (${res.status})`;
      // ASP.NET Core ValidationProblemDetails puts the real reasons in `errors`,
      // e.g. { "Price": ["The Price field is required."] }
      if (data && data.errors && typeof data.errors === "object") {
        const details = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
          .join(" | ");
        if (details) msg = details;
      }
      throw new ApiError(res.status, msg, data);
    }
    return data;
  }

  class ApiError extends Error {
    constructor(status, message, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  return {
    ApiError,

    // ---------- Auth ----------
    register: (dto) => request("/Auth/register", { method: "POST", body: dto }),
    login: (dto) => request("/Auth/login", { method: "POST", body: dto }),
    requestSeller: () => request("/Auth/request-seller", { method: "POST", auth: true }),
    getSellerRequests: () => request("/Auth/seller-requests", { auth: true }),
    approveSellerRequest: (id) => request(`/Auth/seller-requests/${id}/approve`, { method: "POST", auth: true }),
    rejectSellerRequest: (id) => request(`/Auth/seller-requests/${id}/reject`, { method: "POST", auth: true }),

    // ---------- Categories ----------
    getCategories: () => request("/Category"),
    getCategory: (id) => request(`/Category/${id}`),
    createCategory: (dto) => request("/Category", { method: "POST", body: dto, auth: true }),
    deleteCategory: (id) => request(`/Category?Id=${id}`, { method: "DELETE", auth: true }),

    // ---------- Products ----------
    getProducts: (filter = {}) => {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.set(k, v);
      });
      return request(`/Product?${params.toString()}`);
    },
    getProduct: (id) => request(`/Product/${id}`),
    getProductsByCategory: (categoryId) => request(`/Product/category/${categoryId}`),
    addProduct: (formData) => request("/Product", { method: "POST", body: formData, isForm: true, auth: true }),
    editProduct: (id, dto) => request(`/Product/${id}`, { method: "PUT", body: dto, auth: true }),
    deleteProduct: (id) => request(`/Product/${id}`, { method: "DELETE", auth: true }),

    // ---------- Cart ----------
    addToCart: (dto) => request("/Cart", { method: "POST", body: dto, auth: true }),
    getCart: () => request("/Cart/User", { auth: true }),
    deleteCartItem: (cartItemId) => request("/Cart/item", { method: "DELETE", body: cartItemId, auth: true }),
    clearCart: () => request("/Cart/cart", { method: "DELETE", auth: true }),
    updateCartQuantity: (cartItemId, newQuantity) =>
      request(`/Cart/item/quantity?cartItemId=${cartItemId}&newQuantity=${newQuantity}`, {
        method: "PATCH",
        auth: true,
      }),

    // ---------- Orders ----------
    checkout: (address) =>
      request(`/Order/checkout?Address=${encodeURIComponent(address)}`, { method: "POST", auth: true }),
    getMyOrders: () => request("/Order/summary", { auth: true }),
    getAllOrders: () => request("/Order", { auth: true }),
    getOrderDetails: (orderId) =>
      request(`/Order/details?orderId=${orderId}`, { auth: true }).then((data) =>
        Array.isArray(data) ? data[0] : data
      ),
    cancelOrder: (orderId) => request(`/Order/delete?orderId=${orderId}`, { method: "PATCH", auth: true }),
    updateOrderStatus: (orderId, status) =>
      request(`/Order/status?orderId=${orderId}&status=${encodeURIComponent(status)}`, {
        method: "PATCH",
        auth: true,
      }),

    // ---------- Payment ----------
    createPayment: (dto) => request("/Payment", { method: "POST", body: dto, auth: true }),
    confirmPayment: (paymentId, dto) =>
      request(`/Payment/${paymentId}/confirmed`, { method: "POST", body: dto, auth: true }),
    failPayment: (paymentId) => request(`/Payment/${paymentId}/failed`, { method: "POST", auth: true }),
    getPayment: (paymentId) => request(`/Payment/${paymentId}`, { auth: true }),

    // ---------- Reviews ----------
    getReviews: (productId) => request(`/Review/${productId}`),
    createReview: (dto) => request("/Review", { method: "POST", body: dto, auth: true }),
    updateReview: (reviewId, dto) => request(`/Review/${reviewId}`, { method: "PATCH", body: dto, auth: true }),
    deleteReview: (reviewId) => request(`/Review/${reviewId}`, { method: "DELETE", auth: true }),
  };
})();
