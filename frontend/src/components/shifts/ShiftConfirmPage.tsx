"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useShiftPreferences } from "@/hooks/useShiftPreferences";
import { Card } from "@/components/ui/Card";
import { Message } from "@/components/ui/Message";
import { ShiftConfirmCalendar } from "@/components/shifts/ShiftConfirmCalendar";
import { ShiftDetailDialog } from "@/components/shifts/ShiftDetailDialog";
import { ShiftDurationLegend } from "@/components/shifts/ShiftDurationLegend";

export function ShiftConfirmPage() {
  const { getShiftByDate, loadState, shiftCount, shifts } = useShiftPreferences();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedShift = selectedDate ? getShiftByDate(selectedDate) : undefined;

  const sortedShifts = useMemo(
    () => [...shifts].sort((a, b) => a.date.localeCompare(b.date)),
    [shifts],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)] sm:text-2xl">
          提出内容の確認
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          登録済みのシフト希望をカレンダーで確認できます。
        </p>
      </div>

      {loadState === "loading" ? (
        <Message>シフト情報を読み込んでいます...</Message>
      ) : null}

      {loadState === "ready" && shiftCount === 0 ? (
        <Message>
          <span className="block font-semibold">シフト希望はまだ登録されていません。</span>
          <Link
            className="app-button-primary mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] sm:w-auto"
            href="/shifts/input"
          >
            シフトを入力する
          </Link>
        </Message>
      ) : null}

      <Card className="space-y-4 p-2 sm:space-y-5 sm:p-6">
        <ShiftDurationLegend />
        <ShiftConfirmCalendar
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
          shifts={sortedShifts}
        />
      </Card>

      <ShiftDetailDialog
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate}
        shift={selectedShift}
      />
    </div>
  );
}
