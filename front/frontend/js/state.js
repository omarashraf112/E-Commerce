// ============================================================
// Store — token + decoded user info in localStorage
// ============================================================

const Store = (() => {
  const TOKEN_KEY = "ec_token";
  const NAME_KEY = "ec_name";

  function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  function claim(payload, shortName, longUri) {
    return payload[shortName] || payload[longUri] || null;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setAuth(token, fullName) {
    localStorage.setItem(TOKEN_KEY, token);
    if (fullName) localStorage.setItem(NAME_KEY, fullName);
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
  }

  function getUser() {
    const token = getToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    const exp = payload.exp;
    if (exp && Date.now() >= exp * 1000) {
      clearAuth();
      return null;
    }
    const role = claim(payload, "role", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
    const id = claim(payload, "nameid", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
    const roles = Array.isArray(role) ? role : role ? [role] : [];
    return {
      id,
      role,
      roles,
      isAdmin: roles.includes("Admin"),
      isSeller: roles.includes("Seller"),
      fullName: localStorage.getItem(NAME_KEY) || payload.email || "Account",
      email: payload.email || claim(payload, "email", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"),
    };
  }

  function isLoggedIn() {
    return !!getUser();
  }

  return { getToken, setAuth, clearAuth, getUser, isLoggedIn };
})();
