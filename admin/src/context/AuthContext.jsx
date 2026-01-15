import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { clearAdminSession, getAdminToken, getAdminUser, setAdminSession } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAdminToken();
    const storedUser = getAdminUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (email) => {
    const { data } = await axiosInstance.post("/auth/admin-login", { email });

    setToken(data.token);
    setUser(data.user);
    setAdminSession(data.token, data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAdminSession();
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


