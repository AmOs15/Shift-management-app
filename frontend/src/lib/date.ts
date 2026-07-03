const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());

  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseLocalDateKey(value);
  return toLocalDateKey(date) === value;
}

export function getTodayKey(): string {
  return toLocalDateKey(new Date());
}

export function isPastDateKey(dateKey: string): boolean {
  return dateKey < getTodayKey();
}

export function formatShortDate(dateKey: string): string {
  const date = parseLocalDateKey(dateKey);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatLongDate(dateKey: string): string {
  const date = parseLocalDateKey(dateKey);
  const weekday = WEEKDAYS[date.getDay()];

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekday}）`;
}
