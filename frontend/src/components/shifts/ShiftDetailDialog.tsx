"use client";

import Link from "next/link";
import { formatLongDate } from "@/lib/date";
import { formatDuration } from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ShiftDetailDialog({
  onClose,
  onEdit,
  onStartInput,
  selectedDate,
  shift,
  surface = "card",
}: {
  onClose: () => void;
  onEdit?: (date: string) => void;
  onStartInput?: (date: string) => void;
  selectedDate: string | null;
  shift: ShiftPreference | undefined;
  surface?: "card" | "plain";
}) {
  if (!selectedDate) {
    return null;
  }

  if (!shift) {
    const emptyContent = (
      <div className={surface === "card" ? "p-5 sm:p-6" : ""}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              {formatLongDate(selectedDate)}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              この日のシフト希望は登録されていません。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:min-w-32">
            {onStartInput ? (
              <Button
                className="w-full sm:w-auto"
                onClick={() => onStartInput(selectedDate)}
              >
                入力する
              </Button>
            ) : null}
            <Button className="w-full sm:w-auto" onClick={onClose} variant="secondary">
              閉じる
            </Button>
          </div>
        </div>
      </div>
    );

    return surface === "card" ? <Card>{emptyContent}</Card> : emptyContent;
  }

  const detailContent = (
    <div className={surface === "card" ? "p-5 sm:p-6" : ""}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
            {formatLongDate(shift.date)}
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
            <div>
              <dt className="font-bold text-[var(--text-primary)]">希望時間</dt>
              <dd className="font-numeric mt-1 font-bold">
                {shift.startTime}〜{shift.endTime}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[var(--text-primary)]">合計時間</dt>
              <dd className="font-numeric mt-1 font-bold">
                {formatDuration(shift.durationMinutes)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-32">
          {onEdit ? (
            <Button className="w-full sm:w-auto" onClick={() => onEdit(shift.date)}>
              編集する
            </Button>
          ) : (
            <Link
              className="app-button-primary inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] sm:w-auto"
              href={`/shifts/input?date=${shift.date}`}
            >
              編集する
            </Link>
          )}
          <Button className="w-full sm:w-auto" onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );

  return surface === "card" ? <Card>{detailContent}</Card> : detailContent;
}
