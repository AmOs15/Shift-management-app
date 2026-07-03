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
        <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
          提出内容の確認
        </h1>
        <p className="mt-2 text-sm text-slate-600">
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
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
            href="/shifts/input"
          >
            シフトを入力する
          </Link>
        </Message>
      ) : null}

      <Card className="space-y-5 p-4 sm:p-6">
        <ShiftDurationLegend />
        <div className="shift-confirm-scroll">
          <div className="shift-confirm-scroll-inner">
            <ShiftConfirmCalendar
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              shifts={sortedShifts}
            />
          </div>
        </div>
      </Card>

      <ShiftDetailDialog
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate}
        shift={selectedShift}
      />
    </div>
  );
}
