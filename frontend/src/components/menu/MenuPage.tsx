"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatShortDate, getTodayKey, parseLocalDateKey } from "@/lib/date";
import { formatDuration } from "@/lib/shift";
import { useShiftPreferences } from "@/hooks/useShiftPreferences";
import type { ShiftPreference } from "@/types/shift";
import { Button } from "@/components/ui/Button";
import { Message } from "@/components/ui/Message";
import { ShiftConfirmCalendar } from "@/components/shifts/ShiftConfirmCalendar";
import { ShiftDetailDialog } from "@/components/shifts/ShiftDetailDialog";
import { ShiftDurationLegend } from "@/components/shifts/ShiftDurationLegend";
import { ShiftForm } from "@/components/shifts/ShiftForm";

type HomeMode = "input" | "confirm";

type ToastState = {
  action?: {
    label: string;
    onClick: () => void;
  };
  message: string;
};

const modeItems: {
  description: string;
  label: string;
  mode: HomeMode;
}[] = [
  {
    mode: "input",
    label: "入力",
    description: "日付を選んでシフト希望を保存",
  },
  {
    mode: "confirm",
    label: "確認",
    description: "登録済みの日と時間を確認",
  },
];

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 shadow-[0_1px_2px_rgba(20,21,26,0.04)] sm:px-4 sm:py-4">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--accent-100)] text-[10px] font-black text-[var(--accent-600)]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="truncate text-[11px] font-bold text-[var(--text-tertiary)]">
          {label}
        </p>
      </div>
      <p className="font-numeric mt-2 truncate text-xl font-black leading-none tracking-tight text-[var(--text-primary)] sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: HomeMode;
  onChange: (mode: HomeMode) => void;
}) {
  return (
    <div
      aria-label="表示モード"
      className="grid grid-cols-2 rounded-2xl bg-[var(--bg-page)] p-1"
      role="tablist"
    >
      {modeItems.map((item) => {
        const isSelected = mode === item.mode;

        return (
          <button
            aria-selected={isSelected}
            className={[
              "min-h-11 rounded-xl px-3 py-2 text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]",
              isSelected
                ? "bg-[var(--bg-card)] text-[var(--accent-600)] shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-white/60 hover:text-[var(--text-primary)]",
            ].join(" ")}
            key={item.mode}
            onClick={() => onChange(item.mode)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function BottomModeNavigation({
  mode,
  onChange,
}: {
  mode: HomeMode;
  onChange: (mode: HomeMode) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-subtle)] bg-white/90 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_32px_rgba(20,21,26,0.08)] backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        {modeItems.map((item) => {
          const isSelected = mode === item.mode;

          return (
            <button
              aria-current={isSelected ? "page" : undefined}
              className={[
                "bottom-mode-button min-h-14 rounded-2xl px-3 py-2 text-center text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]",
                isSelected
                  ? "app-button-primary"
                  : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-100)]",
              ].join(" ")}
              key={item.mode}
              onClick={() => onChange(item.mode)}
              type="button"
            >
              <span className="block">{item.label}</span>
              <span className="mt-0.5 block truncate text-[11px] font-semibold opacity-80">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeBottomSheet({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        aria-label="パネルを閉じる"
        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[84dvh] max-w-2xl animate-[sheet-up_0.2s_ease-out] overflow-y-auto rounded-t-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-floating)] sm:bottom-6 sm:rounded-2xl sm:px-5 sm:pb-5"
        role="dialog"
      >
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 pb-3 sm:-mx-5 sm:px-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#cfd3df] sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-black tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
            <button
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--accent-100)] hover:text-[var(--accent-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]"
              onClick={onClose}
              type="button"
            >
              閉じる
            </button>
          </div>
        </div>
        {children}
      </section>
    </>
  );
}

function Toast({
  toast,
}: {
  toast: ToastState;
}) {
  return (
    <div
      className="fixed inset-x-3 bottom-[6.25rem] z-50 mx-auto max-w-md animate-[toast-in_0.18s_ease-out] rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white shadow-lg sm:bottom-5"
      role="status"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0">{toast.message}</p>
        {toast.action ? (
          <button
            className="shrink-0 rounded-md px-2 py-1 text-sm font-bold text-sky-200 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={toast.action.onClick}
            type="button"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getNextShift(shifts: ShiftPreference[]) {
  const today = getTodayKey();
  return shifts.find((shift) => shift.date >= today);
}

function getMonthKey(month: Date) {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: Date) {
  return `${month.getFullYear()}年${month.getMonth() + 1}月`;
}

export function MenuPage() {
  const {
    deleteShift,
    getShiftByDate,
    loadState,
    resetShifts,
    shiftCount,
    shifts,
    upsertShift,
  } = useShiftPreferences();
  const [mode, setMode] = useState<HomeMode>("input");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const selectedShift = selectedDate ? getShiftByDate(selectedDate) : undefined;

  const visibleMonthKey = getMonthKey(visibleMonth);
  const visibleMonthShifts = useMemo(
    () => shifts.filter((shift) => shift.date.startsWith(visibleMonthKey)),
    [shifts, visibleMonthKey],
  );
  const totalMinutes = useMemo(
    () => visibleMonthShifts.reduce((total, shift) => total + shift.durationMinutes, 0),
    [visibleMonthShifts],
  );
  const nextShift = useMemo(() => getNextShift(shifts), [shifts]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timerId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
  }

  function handleModeChange(nextMode: HomeMode) {
    setMode(nextMode);
    setSelectedDate(null);
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setVisibleMonth(parseLocalDateKey(date));
  }

  function handleReset() {
    const confirmed = window.confirm(
      "このセッションで入力したシフト希望をすべて削除しますか？",
    );

    if (confirmed) {
      resetShifts();
      setSelectedDate(null);
      showToast({ message: "シフト希望をすべて削除しました。" });
    }
  }

  function restoreShift(shift: ShiftPreference) {
    upsertShift(shift.date, shift.startTime, shift.endTime);
    showToast({ message: `${formatShortDate(shift.date)}を元に戻しました。` });
  }

  return (
    <div className="space-y-4 pb-28 sm:space-y-5 sm:pb-6">
      <section className="app-card rounded-2xl border p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black text-[var(--accent-600)]">シフト希望</p>
            <h1 className="mt-1 text-[1.35rem] font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-2xl">
              {formatMonthLabel(visibleMonth)}の提出状況
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              カレンダーから日付を選んで、入力と確認を切り替えます。
            </p>
          </div>
          <Button
            className="hidden shrink-0 sm:inline-flex"
            disabled={loadState === "loading" || shiftCount === 0}
            onClick={handleReset}
            variant="ghost"
          >
            リセット
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <SummaryMetric
            icon="日"
            label="登録日数"
            value={loadState === "loading" ? "-" : `${visibleMonthShifts.length}日`}
          />
          <SummaryMetric
            icon="時"
            label="合計時間"
            value={loadState === "loading" ? "-" : formatDuration(totalMinutes)}
          />
          <SummaryMetric
            icon="次"
            label="次の予定"
            value={nextShift ? formatShortDate(nextShift.date) : "-"}
          />
        </div>

        <div className="mt-4 hidden sm:block">
          <ModeSwitch mode={mode} onChange={handleModeChange} />
        </div>
      </section>

      <section className="app-card rounded-2xl border p-3 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
              {mode === "input" ? "シフト入力カレンダー" : "提出確認カレンダー"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {mode === "input"
                ? "今日以降の日付をタップすると入力パネルが開きます。"
                : "色付きの日付をタップすると提出内容を確認できます。"}
            </p>
          </div>
          <div className="sm:max-w-80">
            <ShiftDurationLegend />
          </div>
        </div>

        {loadState === "loading" ? (
          <Message>シフト情報を読み込んでいます...</Message>
        ) : (
          <ShiftConfirmCalendar
            ariaLabel={
              mode === "input"
                ? "シフト希望入力カレンダー"
                : "登録済みシフト希望カレンダー"
            }
            disabledPast={mode === "input"}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
            shifts={shifts}
          />
        )}
      </section>

      <div className="sm:hidden">
        <Button
          className="w-full"
          disabled={loadState === "loading" || shiftCount === 0}
          onClick={handleReset}
          variant="ghost"
        >
          このセッションのデータをリセット
        </Button>
      </div>

      <BottomModeNavigation mode={mode} onChange={handleModeChange} />

      {selectedDate ? (
        <HomeBottomSheet
          onClose={() => setSelectedDate(null)}
          title={mode === "input" ? "シフト希望を入力" : "提出内容の確認"}
        >
          {mode === "input" ? (
            <ShiftForm
              existingShift={selectedShift}
              onCancel={() => setSelectedDate(null)}
              onDelete={(date) => {
                const previousShift = getShiftByDate(date);
                deleteShift(date);
                setSelectedDate(null);
                showToast({
                  message: `${formatShortDate(date)}のシフト希望を削除しました。`,
                  action: previousShift
                    ? {
                        label: "元に戻す",
                        onClick: () => restoreShift(previousShift),
                      }
                    : undefined,
                });
              }}
              onSave={(date, startTime, endTime) => {
                const previousShift = getShiftByDate(date);
                const result = upsertShift(date, startTime, endTime);
                setSelectedDate(null);
                showToast({
                  message: `${formatShortDate(date)}のシフト希望を${
                    result === "created" ? "登録" : "更新"
                  }しました。`,
                  action: {
                    label: "元に戻す",
                    onClick: () => {
                      if (previousShift) {
                        restoreShift(previousShift);
                      } else {
                        deleteShift(date);
                        showToast({
                          message: `${formatShortDate(date)}の登録を取り消しました。`,
                        });
                      }
                    },
                  },
                });
                return result;
              }}
              selectedDate={selectedDate}
              surface="plain"
            />
          ) : (
            <ShiftDetailDialog
              onClose={() => setSelectedDate(null)}
              onEdit={(date) => {
                setMode("input");
                setSelectedDate(date);
              }}
              onStartInput={(date) => {
                setMode("input");
                setSelectedDate(date);
              }}
              selectedDate={selectedDate}
              shift={selectedShift}
              surface="plain"
            />
          )}
        </HomeBottomSheet>
      ) : null}

      {toast ? <Toast toast={toast} /> : null}
    </div>
  );
}
