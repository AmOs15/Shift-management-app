"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useMockAuth";
import { ShiftPreferencesProvider } from "@/hooks/useShiftPreferences";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShiftPreferencesProvider>{children}</ShiftPreferencesProvider>
    </AuthProvider>
  );
}
