import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`app-card rounded-2xl border ${className}`}>
      {children}
    </div>
  );
}
