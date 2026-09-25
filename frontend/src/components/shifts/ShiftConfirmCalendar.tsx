"use client";

import { DayPicker, type DayButtonProps } from "@daypicker/react";
import { ja } from "@daypicker/react/locale";
import {
  formatLongDate,
  getTodayKey,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/lib/date";
import {
  aggregateShiftDurationByDate,
  formatDuration,
  formatDurationHoursCompact,
  getShiftAvailabilityLevel,
  type ShiftAvailabilityLevel,
} from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

// Bar length repeats what the fill colour says, so the three steps stay
// distinguishable without relying on hue alone.
const levelBarClassNames: Record<ShiftAvailabilityLevel, string> = {
  none: "w-0",
  short: "w-2",
  middle: "w-3.5",
  long: "w-5",
};

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
  const isToday = Boolean(modifiers.today);

  return (
    <button
      className={[
        className,
        "flex min-h-12 w-full flex-col items-center justify-center overflow-hidden rounded-lg border p-1 text-center leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] sm:min-h-16 sm:p-2",
        hasShift
          ? ""
          : "border-transparent bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-100)]",
      ].join(" ")}
      data-outside-month={isOutsideMonth ? "true" : undefined}
      data-shift-date={dateKey}
      data-shift-level={hasShift ? availabilityLevel : undefined}
      data-today={isToday ? "true" : undefined}
      data-weekday={day.date.getDay()}
      {...buttonProps}
    >
      <span className="font-numeric block w-full text-center text-sm font-bold sm:text-base">
        {day.date.getDate()}
      </span>
      {hasShift ? (
        <>
          <span className="font-numeric mt-0.5 block w-full truncate text-center text-xs font-bold">
            {formatDurationHoursCompact(durationMinutes)}
          </span>
          <span
            aria-hidden="true"
            className={`shift-level-bar mt-1 ${levelBarClassNames[availabilityLevel]}`}
          />
        </>
      ) : null}
    </button>
  );
}

export function ShiftConfirmCalendar({
  ariaLabel = "登録済みシフト希望カレンダー",
  disabledPast = false,
  month,
  onSelectDate,
  onMonthChange,
  selectedDate,
  shifts,
}: {
  ariaLabel?: string;
  disabledPast?: boolean;
  month?: Date;
  onSelectDate: (date: string) => void;
  onMonthChange?: (month: Date) => void;
  selectedDate: string | null;
  shifts: ShiftPreference[];
}) {
  const durationByDate = aggregateShiftDurationByDate(shifts);
  const selected = selectedDate ? parseLocalDateKey(selectedDate) : undefined;
  const today = parseLocalDateKey(getTodayKey());

  return (
    <DayPicker
      aria-label={ariaLabel}
      className="shift-confirm-calendar"
      components={{
        DayButton: (props) => (
          <ConfirmDayButton {...props} durationByDate={durationByDate} />
        ),
      }}
      disabled={disabledPast ? { before: today } : undefined}
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
      month={month}
      onMonthChange={onMonthChange}
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
