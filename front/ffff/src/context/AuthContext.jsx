import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { AuthApi } from "@/api/auth";
import { getToken, setToken, clearToken } from "@/api/client";
import { userFromToken } from "@/utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? userFromToken(token) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await AuthApi.login({ email, password });
    setToken(res.token);
    const decoded = userFromToken(res.token);
    setUser(decoded);
    return decoded;
  }, []);

  const register = useCallback(async (name, email, password) => {
    await AuthApi.register({ name, email, password });
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const requestSeller = useCallback(() => AuthApi.requestSeller(), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
      isSeller: !!user?.isSeller,
      isDashboardOnly: !!user && (user.isAdmin || user.isSeller),
      login,
      register,
      logout,
      requestSeller,
    }),
    [user, login, register, logout, requestSeller]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
