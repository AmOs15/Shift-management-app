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
    <div className="flex flex-wrap gap-3 text-sm text-slate-700" aria-label="時間の長さの凡例">
      {legendItems.map((item) => (
        <div className="flex items-center gap-2" key={item.label}>
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
