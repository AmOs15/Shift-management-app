"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_STORAGE_KEY,
  MOCK_USER,
  type MockAuthSession,
  isMockAuthSession,
} from "@/lib/mock-auth";
import {
  readSessionJson,
  removeSessionValue,
  writeSessionJson,
} from "@/lib/session-storage";

type LoadState = "loading" | "ready";

type AuthContextValue = {
  loadState: LoadState;
  userName: string | null;
  isAuthenticated: boolean;
  login: (name: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isStoredAuthSession(value: unknown): value is MockAuthSession | null {
  return value === null || isMockAuthSession(value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const session = readSessionJson<MockAuthSession | null>(
      AUTH_STORAGE_KEY,
      isStoredAuthSession,
      null,
    );

    setUserName(session?.name ?? null);
    setLoadState("ready");
  }, []);

  const login = useCallback((name: string, password: string) => {
    const trimmedName = name.trim();

    if (trimmedName !== MOCK_USER.name || password !== MOCK_USER.password) {
      return false;
    }

    const session: MockAuthSession = { name: MOCK_USER.name };
    writeSessionJson(AUTH_STORAGE_KEY, session);
    setUserName(session.name);

    return true;
  }, []);

  const logout = useCallback(() => {
    removeSessionValue(AUTH_STORAGE_KEY);
    setUserName(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loadState,
      userName,
      isAuthenticated: userName !== null,
      login,
      logout,
    }),
    [loadState, login, logout, userName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useMockAuth must be used within AuthProvider.");
  }

  return context;
}
