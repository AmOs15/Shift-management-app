const legendItems = [
  {
    label: "4時間以下",
    className: "shift-availability-swatch-short",
  },
  {
    label: "4時間超〜8時間",
    className: "shift-availability-swatch-middle",
  },
  {
    label: "8時間超",
    className: "shift-availability-swatch-long",
  },
] as const;

export function ShiftDurationLegend() {
  return (
    <div
      className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[var(--text-secondary)]"
      aria-label="時間の長さの凡例"
    >
      {legendItems.map((item) => (
        <div className="inline-flex items-center gap-1.5" key={item.label}>
          <span
            className={`shift-availability-swatch ${item.className}`}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
