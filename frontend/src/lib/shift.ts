import { isDateKey } from "@/lib/date";
import type { ShiftPreference } from "@/types/shift";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type ShiftDurationTone = "short" | "medium" | "long";

export function isValidTimeText(time: string): boolean {
  return TIME_PATTERN.test(time);
}

export function timeToMinutes(time: string): number {
  if (!isValidTimeText(time)) {
    return Number.NaN;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

export function isThirtyMinuteStep(time: string): boolean {
  const minutes = timeToMinutes(time);
  return Number.isFinite(minutes) && minutes % 30 === 0;
}

export function getShiftValidationError(startTime: string, endTime: string): string | null {
  if (!startTime) {
    return "開始時刻を入力してください。";
  }

  if (!endTime) {
    return "終了時刻を入力してください。";
  }

  if (!isValidTimeText(startTime) || !isValidTimeText(endTime)) {
    return "時刻はHH:mm形式で入力してください。";
  }

  if (!isThirtyMinuteStep(startTime) || !isThirtyMinuteStep(endTime)) {
    return "時刻は30分単位で入力してください。";
  }

  const durationMinutes = calculateDurationMinutes(startTime, endTime);

  if (durationMinutes <= 0) {
    return "終了時刻は開始時刻より後に設定してください。";
  }

  if (durationMinutes < 30) {
    return "勤務可能時間は30分以上にしてください。";
  }

  if (durationMinutes >= 24 * 60) {
    return "日をまたぐシフトは登録できません。";
  }

  return null;
}

export function createShiftPreference(
  date: string,
  startTime: string,
  endTime: string,
): ShiftPreference {
  return {
    date,
    startTime,
    endTime,
    durationMinutes: calculateDurationMinutes(startTime, endTime),
    updatedAt: new Date().toISOString(),
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) {
    return `${restMinutes}分`;
  }

  if (restMinutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${restMinutes}分`;
}

export function formatDurationCompact(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) {
    return `${restMinutes}m`;
  }

  if (restMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${restMinutes}m`;
}

export function getShiftDurationTone(minutes: number): ShiftDurationTone {
  if (minutes <= 4 * 60) {
    return "short";
  }

  if (minutes <= 8 * 60) {
    return "medium";
  }

  return "long";
}

export function formatTimeRangeCompact(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return minutes === "00" ? String(Number(hours)) : `${Number(hours)}:${minutes}`;
  };

  return `${formatTime(startTime)}–${formatTime(endTime)}`;
}

export function isShiftPreference(value: unknown): value is ShiftPreference {
  if (!value || typeof value !== "object") {
    return false;
  }

  const shift = value as Partial<ShiftPreference>;

  return (
    typeof shift.date === "string" &&
    isDateKey(shift.date) &&
    typeof shift.startTime === "string" &&
    typeof shift.endTime === "string" &&
    typeof shift.durationMinutes === "number" &&
    typeof shift.updatedAt === "string" &&
    getShiftValidationError(shift.startTime, shift.endTime) === null &&
    shift.durationMinutes === calculateDurationMinutes(shift.startTime, shift.endTime)
  );
}

export function isShiftPreferenceArray(value: unknown): value is ShiftPreference[] {
  return Array.isArray(value) && value.every(isShiftPreference);
}
