"use client";

import { DayPicker, type DayButtonProps } from "@daypicker/react";
import { ja } from "@daypicker/react/locale";
import {
  formatLongDate,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/lib/date";
import {
  aggregateShiftDurationByDate,
  formatDuration,
  formatDurationHoursCompact,
  getShiftAvailabilityLevel,
} from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

function ConfirmDayButton({
  durationByDate,
  ...props
}: DayButtonProps & {
  durationByDate: Map<string, number>;
}) {
  const { className = "", day, modifiers, ...buttonProps } = props;
  const dateKey = toLocalDateKey(day.date);
  const durationMinutes = durationByDate.get(dateKey) ?? 0;
  const availabilityLevel = getShiftAvailabilityLevel(durationMinutes);
  const hasShift = availabilityLevel !== "none";
  const isOutsideMonth = Boolean(modifiers.outside);

  return (
    <button
      className={[
        className,
        "flex min-h-[4.5rem] w-full flex-col items-start justify-start overflow-hidden rounded-lg border p-1 text-left leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:min-h-20 sm:p-2",
        hasShift
          ? "shift-confirm-day"
          : "border-transparent bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      data-outside-month={isOutsideMonth ? "true" : undefined}
      data-shift-date={dateKey}
      data-shift-level={hasShift ? availabilityLevel : undefined}
      data-weekday={day.date.getDay()}
      {...buttonProps}
    >
      <span className="block w-full text-xs font-bold sm:text-sm">
        {day.date.getDate()}
      </span>
      {hasShift ? (
        <>
          <span className="mt-auto hidden w-full truncate text-[11px] font-semibold sm:block">
            {formatDurationHoursCompact(durationMinutes)}
          </span>
          <span className="sr-only">登録済み、合計{formatDuration(durationMinutes)}</span>
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
  const durationByDate = aggregateShiftDurationByDate(shifts);
  const selected = selectedDate ? parseLocalDateKey(selectedDate) : undefined;

  return (
    <DayPicker
      aria-label="登録済みシフト希望カレンダー"
      className="shift-confirm-calendar"
      components={{
        DayButton: (props) => (
          <ConfirmDayButton {...props} durationByDate={durationByDate} />
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
          const durationMinutes = durationByDate.get(dateKey) ?? 0;
          const labels = [formatLongDate(dateKey)];

          if (modifiers.today) {
            labels.push("今日");
          }

          if (modifiers.selected) {
            labels.push("選択中");
          }

          if (durationMinutes > 0) {
            labels.push(`登録済み、合計${formatDuration(durationMinutes)}`);
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
