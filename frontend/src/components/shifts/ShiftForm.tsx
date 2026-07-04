"use client";

import { useEffect, useMemo, useState } from "react";
import { formatShortDate, isPastDateKey } from "@/lib/date";
import {
  calculateDurationMinutes,
  formatDuration,
  getShiftValidationError,
} from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Message } from "@/components/ui/Message";
import { ShiftPresetButtons } from "@/components/shifts/ShiftPresetButtons";

type SaveResult = "created" | "updated";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 9);
const MINUTE_OPTIONS = [0, 15, 30, 45];

type ShiftFormProps = {
  existingShift: ShiftPreference | undefined;
  onCancel: () => void;
  onDelete: (date: string) => void;
  onSave: (date: string, startTime: string, endTime: string) => SaveResult;
  selectedDate: string | null;
  surface?: "card" | "plain";
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatTimeValue(hour: number, minute: number) {
  return `${pad2(hour)}:${pad2(minute)}`;
}

function splitTimeValue(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

function getMinuteOptions(hour: number) {
  return hour === 20 ? [0] : MINUTE_OPTIONS;
}

function TimeSelect({
  idPrefix,
  label,
  onChange,
  value,
}: {
  idPrefix: string;
  label: string;
  onChange: (time: string) => void;
  value: string;
}) {
  const { hour, minute } = splitTimeValue(value);
  const minuteOptions = getMinuteOptions(hour);

  function handleHourChange(nextHourValue: string) {
    const nextHour = Number(nextHourValue);
    const nextMinuteOptions = getMinuteOptions(nextHour);
    const nextMinute = nextMinuteOptions.includes(minute)
      ? minute
      : nextMinuteOptions[0];

    onChange(formatTimeValue(nextHour, nextMinute));
  }

  function handleMinuteChange(nextMinuteValue: string) {
    onChange(formatTimeValue(hour, Number(nextMinuteValue)));
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-bold text-[var(--text-primary)]">{label}</legend>
      <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
        <label className="sr-only" htmlFor={`${idPrefix}-hour`}>
          {label} 時
        </label>
        <select
          className="font-numeric min-h-11 w-full rounded-xl border-0 bg-[var(--bg-page)] px-3 py-2 font-bold text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-500)]"
          id={`${idPrefix}-hour`}
          onChange={(event) => handleHourChange(event.target.value)}
          value={hour}
        >
          {HOUR_OPTIONS.map((hourOption) => (
            <option key={hourOption} value={hourOption}>
              {hourOption}
            </option>
          ))}
        </select>
        <span className="text-sm font-bold text-[var(--text-secondary)]">時</span>

        <label className="sr-only" htmlFor={`${idPrefix}-minute`}>
          {label} 分
        </label>
        <select
          className="font-numeric min-h-11 w-full rounded-xl border-0 bg-[var(--bg-page)] px-3 py-2 font-bold text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-500)]"
          id={`${idPrefix}-minute`}
          onChange={(event) => handleMinuteChange(event.target.value)}
          value={minuteOptions.includes(minute) ? minute : minuteOptions[0]}
        >
          {minuteOptions.map((minuteOption) => (
            <option key={minuteOption} value={minuteOption}>
              {pad2(minuteOption)}
            </option>
          ))}
        </select>
        <span className="text-sm font-bold text-[var(--text-secondary)]">分</span>
      </div>
    </fieldset>
  );
}

export function ShiftForm({
  existingShift,
  onCancel,
  onDelete,
  onSave,
  selectedDate,
  surface = "card",
}: ShiftFormProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("20:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setStartTime("09:00");
      setEndTime("20:00");
      setErrorMessage(null);
      return;
    }

    setStartTime(existingShift?.startTime ?? "09:00");
    setEndTime(existingShift?.endTime ?? "20:00");
    setErrorMessage(null);
  }, [existingShift, selectedDate]);

  const validationMessage = useMemo(() => {
    if (!startTime || !endTime) {
      return null;
    }

    return getShiftValidationError(startTime, endTime);
  }, [endTime, startTime]);

  const durationText = useMemo(() => {
    if (validationMessage) {
      return "-";
    }

    const minutes = calculateDurationMinutes(startTime, endTime);
    return Number.isFinite(minutes) && minutes > 0 ? formatDuration(minutes) : "-";
  }, [endTime, startTime, validationMessage]);

  function saveCurrentTimes(nextStartTime = startTime, nextEndTime = endTime) {
    if (!selectedDate) {
      setErrorMessage("カレンダーからシフトを入力する日を選択してください。");
      return;
    }

    if (isPastDateKey(selectedDate)) {
      setErrorMessage("過去日は登録できません。");
      return;
    }

    const nextErrorMessage = getShiftValidationError(nextStartTime, nextEndTime);

    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      return;
    }

    setStartTime(nextStartTime);
    setEndTime(nextEndTime);
    setErrorMessage(null);
    onSave(selectedDate, nextStartTime, nextEndTime);
  }

  function applyPresetTimes(nextStartTime: string, nextEndTime: string) {
    setStartTime(nextStartTime);
    setEndTime(nextEndTime);
    setErrorMessage(null);
  }

  function handleDelete() {
    if (!selectedDate) {
      return;
    }

    const confirmed = window.confirm(
      `${formatShortDate(selectedDate)}のシフト希望を削除しますか？`,
    );

    if (confirmed) {
      onDelete(selectedDate);
    }
  }

  if (!selectedDate) {
    const emptyState = (
      <div className={surface === "card" ? "p-5 sm:p-6" : ""}>
        <p className="text-sm text-[var(--text-secondary)]">
          カレンダーからシフトを入力する日を選択してください。
        </p>
      </div>
    );

    return surface === "card" ? (
      <Card>{emptyState}</Card>
    ) : (
      emptyState
    );
  }

  const visibleError = errorMessage ?? validationMessage;

  const formContent = (
    <div className={surface === "card" ? "p-5 sm:p-6" : ""}>
      <div className="mb-5">
        <p className="text-sm font-bold text-[var(--accent-600)]">
          {existingShift ? "登録済みの日を編集中" : "未登録の日を入力中"}
        </p>
        <h2 className="mt-1 text-lg font-black tracking-tight text-[var(--text-primary)] sm:text-xl">
          {formatShortDate(selectedDate)}
        </h2>
      </div>

      <div className="space-y-5">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <TimeSelect
            idPrefix="shift-start-time"
            label="開始時刻"
            onChange={(nextTime) => {
              setStartTime(nextTime);
              setErrorMessage(null);
            }}
            value={startTime}
          />

          <TimeSelect
            idPrefix="shift-end-time"
            label="終了時刻"
            onChange={(nextTime) => {
              setEndTime(nextTime);
              setErrorMessage(null);
            }}
            value={endTime}
          />
        </div>

        <p className="inline-flex w-fit items-center rounded-full bg-[var(--accent-100)] px-3 py-1.5 text-sm font-bold text-[var(--accent-600)]">
          勤務可能時間：<span className="font-numeric font-black">{durationText}</span>
        </p>

        {visibleError ? <Message variant="error">{visibleError}</Message> : null}

        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">時間プリセット</p>
            <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              入力欄に時間を反映します。登録には保存ボタンを押してください。
            </p>
          </div>
          <ShiftPresetButtons
            onSelectPreset={(nextStartTime, nextEndTime) => {
              applyPresetTimes(nextStartTime, nextEndTime);
            }}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button className="w-full sm:w-auto" onClick={() => saveCurrentTimes()}>
            {existingShift ? "変更を保存" : "この内容で登録"}
          </Button>
          {existingShift ? (
            <Button className="w-full sm:w-auto" onClick={handleDelete} variant="danger">
              この日の希望を削除
            </Button>
          ) : null}
          <Button className="w-full sm:w-auto" onClick={onCancel} variant="secondary">
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );

  return surface === "card" ? <Card>{formContent}</Card> : formContent;
}
