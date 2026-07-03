import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/layout/AppHeader";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
