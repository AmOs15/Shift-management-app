"use client";

import Link from "next/link";
import { formatLongDate } from "@/lib/date";
import { formatDuration } from "@/lib/shift";
import type { ShiftPreference } from "@/types/shift";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ShiftDetailDialog({
  onClose,
  selectedDate,
  shift,
}: {
  onClose: () => void;
  selectedDate: string | null;
  shift: ShiftPreference | undefined;
}) {
  if (!selectedDate) {
    return null;
  }

  if (!shift) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {formatLongDate(selectedDate)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              この日のシフト希望は登録されていません。
            </p>
          </div>
          <Button className="w-full sm:w-auto" onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {formatLongDate(shift.date)}
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div>
              <dt className="font-semibold text-slate-900">希望時間</dt>
              <dd className="mt-1">
                {shift.startTime}〜{shift.endTime}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">合計時間</dt>
              <dd className="mt-1">{formatDuration(shift.durationMinutes)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-32">
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
            href={`/shifts/input?date=${shift.date}`}
          >
            編集する
          </Link>
          <Button className="w-full sm:w-auto" onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </div>
    </Card>
  );
}
