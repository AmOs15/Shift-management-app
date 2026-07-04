"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockAuth } from "@/hooks/useMockAuth";

const routeLabels: Record<string, string> = {
  "/menu": "ホーム",
  "/shifts/input": "シフト入力",
  "/shifts/confirm": "提出内容の確認",
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userName } = useMockAuth();
  const currentLabel = routeLabels[pathname] ?? "シフト希望";
  const showMenuLink = pathname !== "/menu";

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-white/85 shadow-[0_1px_2px_rgba(20,21,26,0.04)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
          <div className="min-w-0">
            <Link
              className="block truncate text-base font-black tracking-tight text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]"
              href="/menu"
            >
              シフト希望
            </Link>
            <p className="mt-0.5 text-xs font-bold text-[var(--text-tertiary)]">
              {currentLabel}
            </p>
          </div>
          {showMenuLink ? (
            <Link
              className="inline-flex h-8 shrink-0 items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--accent-100)] hover:text-[var(--accent-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]"
              href="/menu"
            >
              ホーム
            </Link>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <p className="hidden min-w-0 truncate text-xs text-[var(--text-secondary)] sm:block">
            <span className="font-bold text-[var(--text-primary)]">{userName}</span>
          </p>
          <button
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] active:scale-[0.98]"
            onClick={handleLogout}
            type="button"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
