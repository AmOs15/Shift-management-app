"use client";

import Link from "next/link";
import { useShiftPreferences } from "@/hooks/useShiftPreferences";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const menuItems = [
  {
    title: "シフトを入力する",
    description: "カレンダーから勤務可能な日時を登録します。",
    href: "/shifts/input",
  },
  {
    title: "提出内容を確認する",
    description: "登録したシフト希望をカレンダーで確認します。",
    href: "/shifts/confirm",
  },
] as const;

export function MenuPage() {
  const { loadState, resetShifts, shiftCount } = useShiftPreferences();

  function handleReset() {
    const confirmed = window.confirm(
      "このセッションで入力したシフト希望をすべて削除しますか？",
    );

    if (confirmed) {
      resetShifts();
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">メニュー</h1>
        <p className="mt-2 text-sm text-slate-600">
          シフト希望の入力と提出内容の確認を行います。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => (
          <Link
            className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            href={item.href}
            key={item.href}
          >
            <Card className="h-full p-5 transition group-hover:border-blue-300 group-hover:shadow-md sm:p-6">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-slate-700">現在登録されているシフト数</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {loadState === "loading" ? "-" : shiftCount}件
          </p>
        </div>
        <Button
          disabled={loadState === "loading" || shiftCount === 0}
          className="w-full sm:w-auto"
          onClick={handleReset}
          variant="danger"
        >
          データをリセット
        </Button>
      </Card>
    </div>
  );
}
