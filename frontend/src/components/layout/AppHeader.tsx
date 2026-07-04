"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockAuth } from "@/hooks/useMockAuth";

const routeLabels: Record<string, string> = {
  "/menu": "メニュー",
  "/shifts/input": "シフト入力",
  "/shifts/confirm": "提出内容の確認",
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userName } = useMockAuth();
  const currentLabel = routeLabels[pathname] ?? "シフト希望";

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
          <div className="min-w-0">
            <Link
              className="block truncate text-base font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              href="/menu"
            >
              シフト希望
            </Link>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{currentLabel}</p>
          </div>
          <Link
            className="inline-flex h-8 shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            href="/menu"
          >
            メニュー
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <p className="min-w-0 truncate text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{userName}</span>
          </p>
          <button
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
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
