import { BASE_URL } from "@/api/client";

// The backend's ORIGIN (no /api suffix), used to resolve relative image paths
// like "/images/xxx.jpg" that the backend returns for uploaded product photos.
const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
