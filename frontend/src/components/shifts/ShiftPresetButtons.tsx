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
    <div className="grid gap-2 sm:grid-cols-3">
      {presets.map((preset) => (
        <button
          className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:block sm:min-h-16"
          key={`${preset.startTime}-${preset.endTime}`}
          onClick={() => onSelectPreset(preset.startTime, preset.endTime)}
          type="button"
        >
          <span className="block text-sm font-bold text-slate-950">{preset.label}</span>
          <span className="block text-sm text-slate-600 sm:mt-1">
            {preset.description}
          </span>
        </button>
      ))}
    </div>
  );
}
