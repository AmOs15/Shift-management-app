"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatShortDate, getTodayKey, parseLocalDateKey } from "@/lib/date";
import { splitDurationParts } from "@/lib/shift";
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

// An undoable toast has to stay long enough to find and press the action.
const TOAST_DURATION_MS = 4000;
const TOAST_WITH_ACTION_DURATION_MS = 6500;

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

function MetricUnit({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold text-[var(--text-secondary)]">{children}</span>
  );
}

function SummaryMetric({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="truncate text-xs font-medium text-[var(--text-tertiary)]">
        {label}
      </dt>
      <dd className="font-numeric mt-1.5 flex items-baseline gap-0.5 overflow-hidden whitespace-nowrap text-2xl font-bold leading-none tracking-[-0.02em] text-[var(--text-primary)]">
        {children}
      </dd>
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
      className="grid grid-cols-2 rounded-xl bg-[var(--bg-subtle)] p-1"
      role="tablist"
    >
      {modeItems.map((item) => {
        const isSelected = mode === item.mode;

        return (
          <button
            aria-selected={isSelected}
            className={[
              "min-h-11 rounded-lg px-3 py-2 text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]",
              isSelected
                ? "bg-[var(--bg-card)] text-[var(--accent-text)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 pb-[env(safe-area-inset-bottom)] pt-2 sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        {modeItems.map((item) => {
          const isSelected = mode === item.mode;

          return (
            <button
              aria-current={isSelected ? "page" : undefined}
              className={[
                "bottom-mode-button min-h-14 rounded-xl px-3 py-2 text-center text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]",
                isSelected
                  ? "app-button-primary"
                  : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-100)]",
              ].join(" ")}
              key={item.mode}
              onClick={() => onChange(item.mode)}
              type="button"
            >
              <span className="block">{item.label}</span>
              <span className="mt-0.5 block truncate text-xs font-medium opacity-80">
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
  const sheetRef = useRef<HTMLElement>(null);

  // Escape closes, and Tab cycles inside the sheet instead of reaching the
  // page behind the scrim.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) {
        return;
      }

      const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])',
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || activeElement === sheetRef.current)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Move focus into the sheet on open, lock the page behind it, and hand focus
  // back to whatever opened it on close.
  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, []);

  return (
    <>
      <button
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-[var(--overlay)]"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-labelledby="home-sheet-title"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[84dvh] max-w-2xl animate-[sheet-up_0.2s_ease-out] overflow-y-auto rounded-t-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-floating)] focus:outline-none sm:bottom-6 sm:rounded-xl sm:px-5 sm:pb-5"
        ref={sheetRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 pb-3 sm:-mx-5 sm:px-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--sheet-grabber)] sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2
              className="min-w-0 truncate text-base font-bold tracking-tight text-[var(--text-primary)]"
              id="home-sheet-title"
            >
              {title}
            </h2>
            <button
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--accent-100)] hover:text-[var(--accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)]"
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
      className="fixed inset-x-3 bottom-[6.25rem] z-50 mx-auto max-w-md animate-[toast-in_0.18s_ease-out] rounded-xl border border-[var(--toast-border)] bg-[var(--toast-bg)] px-4 py-3 text-sm text-[var(--toast-text)] shadow-[var(--shadow-floating)] sm:bottom-5"
      role="status"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0">{toast.message}</p>
        {toast.action ? (
          <button
            className="shrink-0 rounded-md px-2 py-1 text-sm font-bold text-[var(--toast-action)] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--toast-action)]"
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
  const isLoading = loadState === "loading";

  const visibleMonthKey = getMonthKey(visibleMonth);
  const visibleMonthShifts = useMemo(
    () => shifts.filter((shift) => shift.date.startsWith(visibleMonthKey)),
    [shifts, visibleMonthKey],
  );
  const totalMinutes = useMemo(
    () => visibleMonthShifts.reduce((total, shift) => total + shift.durationMinutes, 0),
    [visibleMonthShifts],
  );
  const totalDuration = splitDurationParts(totalMinutes);
  const nextShift = useMemo(() => getNextShift(shifts), [shifts]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timerId = window.setTimeout(
      () => setToast(null),
      toast.action ? TOAST_WITH_ACTION_DURATION_MS : TOAST_DURATION_MS,
    );
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
      <section className="app-card rounded-xl border p-4 sm:p-5">
        <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
          {formatMonthLabel(visibleMonth)}の提出状況
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          カレンダーから日付を選んで、入力と確認を切り替えます。
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
          <SummaryMetric label="登録日数">
            {isLoading ? (
              "—"
            ) : (
              <>
                {visibleMonthShifts.length}
                <MetricUnit>日</MetricUnit>
              </>
            )}
          </SummaryMetric>
          <SummaryMetric label="合計時間">
            {isLoading ? (
              "—"
            ) : (
              <>
                {totalDuration.hours}
                <MetricUnit>時間</MetricUnit>
                {totalDuration.minutes > 0 ? (
                  <>
                    {totalDuration.minutes}
                    <MetricUnit>分</MetricUnit>
                  </>
                ) : null}
              </>
            )}
          </SummaryMetric>
          <SummaryMetric className="col-span-2 sm:col-span-1" label="次の予定">
            {isLoading || !nextShift ? (
              <span className="text-base font-bold text-[var(--text-tertiary)]">
                {isLoading ? "—" : "なし"}
              </span>
            ) : (
              formatShortDate(nextShift.date)
            )}
          </SummaryMetric>
        </dl>

        <div className="mt-5 hidden sm:block">
          <ModeSwitch mode={mode} onChange={handleModeChange} />
        </div>
      </section>

      <section className="app-card rounded-xl border p-3 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold tracking-[-0.01em] text-[var(--text-primary)]">
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

        {isLoading ? (
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

      <div className="flex justify-center">
        <Button
          className="app-button-destructive w-full sm:w-auto"
          disabled={isLoading || shiftCount === 0}
          onClick={handleReset}
          variant="secondary"
        >
          このセッションのシフト希望をすべて削除
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
