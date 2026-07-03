"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockAuth } from "@/hooks/useMockAuth";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const router = useRouter();
  const { logout, userName } = useMockAuth();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Link className="text-base font-bold text-slate-950 sm:text-lg" href="/menu">
            シフト希望
          </Link>
          <Link
            className="inline-flex min-h-9 items-center rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            href="/menu"
          >
            メニューへ戻る
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <p className="text-sm leading-6 text-slate-600">
            ログイン中：<span className="font-semibold text-slate-900">{userName}</span>
          </p>
          <Button className="w-full sm:w-auto" onClick={handleLogout} variant="secondary">
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
