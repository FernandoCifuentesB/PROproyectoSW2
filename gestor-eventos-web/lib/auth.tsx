"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Role = "ADMIN" | "USER";
type User = { id: string; name: string; email: string; role: Role };

type AuthState = {
  token: string | null;
  user: User | null;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("expiresAt");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    const expiresAt = localStorage.getItem("expiresAt");

    if (!t || !u) return;

    if (expiresAt && Date.now() > Number(expiresAt)) {
      clearSession();
      return;
    }

    try {
      setToken(t);
      setUser(JSON.parse(u));
    } catch {
      clearSession();
    }
  }, []);

  function login(data: { token: string; user: User }) {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("expiresAt", String(expiresAt));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}