"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockAuth } from "@/hooks/useMockAuth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loadState } = useMockAuth();

  useEffect(() => {
    if (loadState === "ready" && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loadState, router]);

  if (loadState === "loading" || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <p className="text-sm text-slate-600">認証状態を確認しています...</p>
      </main>
    );
  }

  return children;
}
