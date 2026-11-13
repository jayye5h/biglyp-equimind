import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // Brand is NOT forced here: public pages (Biglyp hub, product landings, logins) choose their own brand,
  // and signed-in app pages re-apply the user's programme brand in AppHeader (components/Shell.jsx).

  useEffect(() => {
    if (!localStorage.getItem("eq_token")) {
      setReady(true);
      return;
    }
    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("eq_token"))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (userId) => {
    const r = await api.post("/auth/demo-login", { user_id: userId });
    localStorage.setItem("eq_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("eq_token");
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);
