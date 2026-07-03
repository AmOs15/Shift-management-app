"use client";

import { DayPicker } from "@daypicker/react";
import { ja } from "@daypicker/react/locale";
import {
  formatLongDate,
  getTodayKey,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/lib/date";

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

type ShiftCalendarProps = {
  disabledPast?: boolean;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  shiftDates: string[];
};

export function ShiftCalendar({
  disabledPast = false,
  onSelectDate,
  selectedDate,
  shiftDates,
}: ShiftCalendarProps) {
  const today = parseLocalDateKey(getTodayKey());
  const selected = selectedDate ? parseLocalDateKey(selectedDate) : undefined;
  const registeredDates = shiftDates.map(parseLocalDateKey);

  return (
    <DayPicker
      aria-label="シフト希望日を選択"
      className="shift-calendar"
      disabled={disabledPast ? { before: today } : undefined}
      fixedWeeks
      formatters={{
        formatCaption: (month) => `${month.getFullYear()}年${month.getMonth() + 1}月`,
        formatWeekdayName: (weekday) => weekdayLabels[weekday.getDay()],
      }}
      labels={{
        labelDayButton: (date, modifiers) => {
          const dateKey = toLocalDateKey(date);
          const labels = [formatLongDate(dateKey)];

          if (modifiers.today) {
            labels.push("今日");
          }

          if (modifiers.selected) {
            labels.push("選択中");
          }

          if (modifiers.registered) {
            labels.push("登録済み");
          }

          return labels.join("、");
        },
      }}
      locale={ja}
      mode="single"
      modifiers={{ registered: registeredDates }}
      modifiersClassNames={{ registered: "shift-day-registered" }}
      onSelect={(date) => {
        if (date) {
          onSelectDate(toLocalDateKey(date));
        }
      }}
      required
      selected={selected}
      showOutsideDays
      weekStartsOn={1}
    />
  );
}
