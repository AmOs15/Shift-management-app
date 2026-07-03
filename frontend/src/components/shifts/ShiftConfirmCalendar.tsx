"use client";

import { DayPicker, type DayButtonProps } from "@daypicker/react";
import { ja } from "@daypicker/react/locale";
import {
  formatLongDate,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/lib/date";
import {
  formatDuration,
  formatDurationCompact,
  formatTimeRangeCompact,
  getShiftDurationTone,
  type ShiftDurationTone,
} from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

const toneClassNames: Record<ShiftDurationTone, string> = {
  short: "border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100",
  medium: "border-sky-300 bg-sky-200 text-sky-950 hover:bg-sky-300",
  long: "border-sky-700 bg-sky-700 text-white hover:bg-sky-800",
};

function ConfirmDayButton({
  shiftsByDate,
  ...props
}: DayButtonProps & {
  shiftsByDate: Map<string, ShiftPreference>;
}) {
  const { className = "", day, modifiers, ...buttonProps } = props;
  const dateKey = toLocalDateKey(day.date);
  const shift = shiftsByDate.get(dateKey);
  const tone = shift ? getShiftDurationTone(shift.durationMinutes) : null;

  return (
    <button
      className={[
        className,
        "flex min-h-20 w-full flex-col items-start justify-start rounded-lg border p-2 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
        modifiers.outside ? "opacity-50" : "",
        shift && tone
          ? toneClassNames[tone]
          : "border-transparent bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      {...buttonProps}
    >
      <span className="text-sm font-bold">{day.date.getDate()}</span>
      {shift ? (
        <>
          <span className="mt-1 hidden leading-4 sm:block">
            {shift.startTime}–{shift.endTime}
          </span>
          <span className="mt-1 leading-4 sm:hidden">
            {formatTimeRangeCompact(shift.startTime, shift.endTime)}
          </span>
          <span className="mt-0.5 hidden font-semibold leading-4 sm:block">
            {formatDuration(shift.durationMinutes)}
          </span>
          <span className="mt-0.5 font-semibold leading-4 sm:hidden">
            {formatDurationCompact(shift.durationMinutes)}
          </span>
        </>
      ) : null}
    </button>
  );
}

export function ShiftConfirmCalendar({
  onSelectDate,
  selectedDate,
  shifts,
}: {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  shifts: ShiftPreference[];
}) {
  const shiftsByDate = new Map(shifts.map((shift) => [shift.date, shift]));
  const selected = selectedDate ? parseLocalDateKey(selectedDate) : undefined;

  return (
    <DayPicker
      aria-label="登録済みシフト希望カレンダー"
      className="shift-confirm-calendar"
      components={{
        DayButton: (props) => (
          <ConfirmDayButton {...props} shiftsByDate={shiftsByDate} />
        ),
      }}
      fixedWeeks
      formatters={{
        formatCaption: (month) => `${month.getFullYear()}年${month.getMonth() + 1}月`,
        formatWeekdayName: (weekday) => weekdayLabels[weekday.getDay()],
      }}
      labels={{
        labelDayButton: (date, modifiers) => {
          const dateKey = toLocalDateKey(date);
          const shift = shiftsByDate.get(dateKey);
          const labels = [formatLongDate(dateKey)];

          if (modifiers.today) {
            labels.push("今日");
          }

          if (modifiers.selected) {
            labels.push("選択中");
          }

          if (shift) {
            labels.push(
              `${shift.startTime}から${shift.endTime}、${formatDuration(
                shift.durationMinutes,
              )}`,
            );
          }

          return labels.join("、");
        },
      }}
      locale={ja}
      mode="single"
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
