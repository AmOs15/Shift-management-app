import { isDateKey } from "@/lib/date";
import type { ShiftPreference } from "@/types/shift";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MIN_TIME_MINUTES = 9 * 60;
const MAX_TIME_MINUTES = 20 * 60;
const TIME_STEP_MINUTES = 15;

export type ShiftAvailabilityLevel = "none" | "short" | "middle" | "long";

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

export function isFifteenMinuteStep(time: string): boolean {
  const minutes = timeToMinutes(time);
  return Number.isFinite(minutes) && minutes % TIME_STEP_MINUTES === 0;
}

export function isWithinSelectableTimeRange(time: string): boolean {
  const minutes = timeToMinutes(time);
  return (
    Number.isFinite(minutes) &&
    minutes >= MIN_TIME_MINUTES &&
    minutes <= MAX_TIME_MINUTES
  );
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

  if (!isFifteenMinuteStep(startTime) || !isFifteenMinuteStep(endTime)) {
    return "時刻は15分単位で入力してください。";
  }

  if (!isWithinSelectableTimeRange(startTime) || !isWithinSelectableTimeRange(endTime)) {
    return "時刻は09:00〜20:00の範囲で選択してください。";
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

export function formatDurationHoursCompact(minutes: number): string {
  const hours = minutes / 60;
  const formattedHours = Number.isInteger(hours)
    ? String(hours)
    : String(Number(hours.toFixed(2)));

  return `${formattedHours}h`;
}

export function getShiftAvailabilityLevel(minutes: number): ShiftAvailabilityLevel {
  if (minutes <= 0) {
    return "none";
  }

  if (minutes <= 4 * 60) {
    return "short";
  }

  if (minutes <= 8 * 60) {
    return "middle";
  }

  return "long";
}

export function aggregateShiftDurationByDate(
  shifts: ShiftPreference[],
): Map<string, number> {
  return shifts.reduce((durationByDate, shift) => {
    const currentDuration = durationByDate.get(shift.date) ?? 0;
    durationByDate.set(shift.date, currentDuration + shift.durationMinutes);
    return durationByDate;
  }, new Map<string, number>());
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
