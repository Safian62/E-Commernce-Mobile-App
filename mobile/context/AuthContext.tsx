import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

type User = {
  _id: string;
  name: string;
  email: string;
  imageUrl?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "mobile_token";
const USER_KEY = "mobile_user";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const saveSession = async (newToken: string, newUser: User) => {
    assertNonEmptyString(newToken, "token");
    assertNonEmptyString(newUser?._id, "user._id");
    assertNonEmptyString(newUser?.email, "user.email");
    assertNonEmptyString(newUser?.name, "user.name");

    setToken(newToken);
    setUser(newUser);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
  };

  const clearSession = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  };

  const authClient = axios.create({
    baseURL: apiBaseUrl,
  });

  const login = async (email: string, password: string) => {
    const { data } = await authClient.post("/auth/login", { email, password });
    await saveSession(data?.token, data?.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authClient.post("/auth/register", { name, email, password });
    return { email: data.email };
  };

  const verifyOTP = async (email: string, otp: string) => {
    const { data } = await authClient.post("/auth/verify-otp", { email, otp });
    await saveSession(data?.token, data?.user);
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


