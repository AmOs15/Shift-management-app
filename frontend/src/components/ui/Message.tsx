import type { ReactNode } from "react";

type MessageVariant = "info" | "success" | "error";

const variantClassNames: Record<MessageVariant, string> = {
  info: "border-[var(--accent-200)] bg-[var(--accent-100)] text-[var(--accent-text)]",
  success:
    "border-[var(--success-soft-border)] bg-[var(--success-soft-bg)] text-[var(--success-soft-text)]",
  error:
    "border-[var(--danger-soft-border)] bg-[var(--danger-soft-bg)] text-[var(--danger-soft-text)]",
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
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${variantClassNames[variant]} ${className}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
