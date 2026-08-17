export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7051/api";
const TOKEN_KEY = "souqly_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function parseErrorMessage(raw, status) {
  return (
    (raw && (raw.message || raw.title || (raw.errors && Object.values(raw.errors).flat().join(" ")))) ||
    (typeof raw === "string" && raw) ||
    `Request failed (${status}).`
  );
}

/**
 * Central JSON request helper.
 * - `auth: true` attaches the bearer token (throws if missing).
 * - `query` is a plain object serialized to a query string (undefined/null/"" skipped).
 * - Non-2xx responses are parsed for a `message`/`title` field when possible.
 */
export async function request(path, { method = "GET", body, auth = false, query } = {}) {
  let url = `${BASE_URL}${path}`;

  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError("You need to sign in first.", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const raw = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) throw new ApiError(parseErrorMessage(raw, res.status), res.status);
  return raw;
}

/**
 * Multipart form-data variant, used only for the product image-upload endpoint.
 * Never set Content-Type manually here — the browser adds the multipart boundary itself.
 */
export async function requestForm(path, { method = "POST", formData, auth = false } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {};
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError("You need to sign in first.", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: formData });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  const raw = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) throw new ApiError(parseErrorMessage(raw, res.status), res.status);
  return raw;
}
