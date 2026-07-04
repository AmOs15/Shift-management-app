import type { ReactNode } from "react";

type MessageVariant = "info" | "success" | "error";

const variantClassNames: Record<MessageVariant, string> = {
  info: "border-[var(--accent-100)] bg-[var(--accent-100)] text-[var(--accent-600)]",
  success: "border-emerald-100 bg-emerald-50 text-emerald-800",
  error: "border-rose-100 bg-rose-50 text-rose-800",
};

export function Message({
  children,
  className = "",
  variant = "info",
}: {
  children: ReactNode;
  className?: string;
  variant?: MessageVariant;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${variantClassNames[variant]} ${className}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
