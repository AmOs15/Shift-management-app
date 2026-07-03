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

type ShiftFormProps = {
  existingShift: ShiftPreference | undefined;
  onCancel: () => void;
  onDelete: (date: string) => void;
  onSave: (date: string, startTime: string, endTime: string) => SaveResult;
  selectedDate: string | null;
};

export function ShiftForm({
  existingShift,
  onCancel,
  onDelete,
  onSave,
  selectedDate,
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
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm text-slate-600">
          カレンダーからシフトを入力する日を選択してください。
        </p>
      </Card>
    );
  }

  const visibleError = errorMessage ?? validationMessage;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-blue-700">
          {existingShift ? "登録済みの日を編集中" : "未登録の日を入力中"}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
          {formatShortDate(selectedDate)}
        </h2>
      </div>

      <div className="space-y-5">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-800"
              htmlFor="shift-start-time"
            >
              開始時刻
            </label>
            <input
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="shift-start-time"
              onChange={(event) => {
                setStartTime(event.target.value);
                setErrorMessage(null);
              }}
              step={1800}
              type="time"
              value={startTime}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-800"
              htmlFor="shift-end-time"
            >
              終了時刻
            </label>
            <input
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="shift-end-time"
              onChange={(event) => {
                setEndTime(event.target.value);
                setErrorMessage(null);
              }}
              step={1800}
              type="time"
              value={endTime}
            />
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-700">
          勤務可能時間：<span className="text-slate-950">{durationText}</span>
        </p>

        {visibleError ? <Message variant="error">{visibleError}</Message> : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">時間プリセット</p>
          <ShiftPresetButtons
            onSelectPreset={(nextStartTime, nextEndTime) => {
              saveCurrentTimes(nextStartTime, nextEndTime);
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
    </Card>
  );
}
