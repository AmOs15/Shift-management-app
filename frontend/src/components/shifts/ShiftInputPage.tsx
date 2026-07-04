"use client";

import { useEffect, useMemo, useState } from "react";
import { formatShortDate, isDateKey, isPastDateKey } from "@/lib/date";
import { useShiftPreferences } from "@/hooks/useShiftPreferences";
import { Card } from "@/components/ui/Card";
import { Message } from "@/components/ui/Message";
import { ShiftCalendar } from "@/components/shifts/ShiftCalendar";
import { ShiftForm } from "@/components/shifts/ShiftForm";

export function ShiftInputPage({ initialDate }: { initialDate: string | null }) {
  const { deleteShift, getShiftByDate, loadState, shifts, upsertShift } =
    useShiftPreferences();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate && isDateKey(initialDate) && !isPastDateKey(initialDate)) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timerId = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timerId);
  }, [message]);

  const shiftDates = useMemo(() => shifts.map((shift) => shift.date), [shifts]);
  const selectedShift = selectedDate ? getShiftByDate(selectedDate) : undefined;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">シフト入力</h1>
        <p className="mt-2 text-sm text-slate-600">
          カレンダーから日付を選び、勤務可能な時間を登録します。
        </p>
      </div>

      {message ? <Message variant="success">{message}</Message> : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-6">
        <Card className="min-w-0 p-3 sm:p-6">
          {loadState === "loading" ? (
            <p className="text-sm text-slate-600">シフト情報を読み込んでいます...</p>
          ) : (
            <ShiftCalendar
              disabledPast
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              shiftDates={shiftDates}
            />
          )}
        </Card>

        <ShiftForm
          existingShift={selectedShift}
          onCancel={() => setSelectedDate(null)}
          onDelete={(date) => {
            deleteShift(date);
            setSelectedDate(null);
            setMessage(`${formatShortDate(date)}のシフト希望を削除しました。`);
          }}
          onSave={(date, startTime, endTime) => {
            const result = upsertShift(date, startTime, endTime);
            setMessage(
              `${formatShortDate(date)}のシフト希望を${
                result === "created" ? "登録" : "更新"
              }しました。`,
            );
            setSelectedDate(null);
            return result;
          }}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
