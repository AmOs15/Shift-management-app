import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`app-card rounded-xl border ${className}`}>
      {children}
    </div>
  );
}
