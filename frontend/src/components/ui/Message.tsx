import type { ReactNode } from "react";

type MessageVariant = "info" | "success" | "error";

const variantClassNames: Record<MessageVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
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
      className={`rounded-lg border px-4 py-3 text-sm ${variantClassNames[variant]} ${className}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
