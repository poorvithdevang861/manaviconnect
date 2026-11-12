"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type SignupInput, type User } from "@/lib/api";
import { AUTH_EXPIRED_EVENT, getToken, setToken } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  /** True until the stored token has been checked against /api/users/me. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.users
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.access_token);
    // Login returns a trimmed user; fetch the full profile.
    const me = await api.users.me().catch(() => res.user);
    setUser(me);
    return me;
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const res = await api.auth.signup(input);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Only same-site paths are allowed as a post-login redirect. */
export function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function canManage(user: User | null, createdBy: number): boolean {
  return !!user && (user.id === createdBy || user.is_admin);
}
