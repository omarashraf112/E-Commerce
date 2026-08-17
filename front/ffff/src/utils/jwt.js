// Minimal JWT payload decoder — no signature verification (the backend does that).
// We only read claims here to drive UI state (name, role, expiry).
export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

const NAME_ID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function userFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const exp = payload.exp;
  if (exp && Date.now() >= exp * 1000) return null;

  const roles = payload[ROLE] ? (Array.isArray(payload[ROLE]) ? payload[ROLE] : [payload[ROLE]]) : [];

  return {
    id: payload[NAME_ID] || payload.sub || null,
    email: payload[EMAIL] || null,
    fullName: payload[NAME] || payload[EMAIL] || "Account",
    roles,
    isAdmin: roles.includes("Admin"),
    isSeller: roles.includes("Seller"),
    exp,
  };
}
