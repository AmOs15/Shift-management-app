type ShiftPreset = {
  description: string;
  endTime: string;
  label: string;
  startTime: string;
};

const presets: ShiftPreset[] = [
  {
    label: "終日",
    description: "09:00〜20:00",
    startTime: "09:00",
    endTime: "20:00",
  },
  {
    label: "日中",
    description: "09:00〜15:00",
    startTime: "09:00",
    endTime: "15:00",
  },
  {
    label: "夕方",
    description: "16:00〜20:00",
    startTime: "16:00",
    endTime: "20:00",
  },
];

export function ShiftPresetButtons({
  onSelectPreset,
}: {
  onSelectPreset: (startTime: string, endTime: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {presets.map((preset) => (
        <button
          className="shift-preset-button flex min-h-12 min-w-[8.5rem] shrink-0 items-center justify-between gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-left shadow-[0_1px_2px_rgba(20,21,26,0.04)] transition duration-150 ease-out hover:border-[var(--accent-500)] hover:bg-[var(--accent-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] sm:block sm:min-h-14 sm:min-w-0"
          key={`${preset.startTime}-${preset.endTime}`}
          onClick={() => onSelectPreset(preset.startTime, preset.endTime)}
          type="button"
        >
          <span className="block text-sm font-black text-[var(--text-primary)]">
            {preset.label}
          </span>
          <span className="font-numeric block text-xs font-bold text-[var(--text-secondary)] sm:mt-1">
            {preset.description}
          </span>
        </button>
      ))}
    </div>
  );
}
