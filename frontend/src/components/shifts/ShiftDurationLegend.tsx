const legendItems = [
  {
    label: "4時間以下",
    className: "bg-sky-50 border-sky-200",
  },
  {
    label: "4時間超〜8時間",
    className: "bg-sky-200 border-sky-300",
  },
  {
    label: "8時間超",
    className: "bg-sky-700 border-sky-700",
  },
] as const;

export function ShiftDurationLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-700" aria-label="時間の長さの凡例">
      {legendItems.map((item) => (
        <div className="flex items-center gap-2" key={item.label}>
          <span
            className={`inline-block h-4 w-4 rounded border ${item.className}`}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
