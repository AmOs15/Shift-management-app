import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-blue-700 bg-blue-700 text-white hover:bg-blue-800 focus-visible:outline-blue-700 disabled:border-blue-300 disabled:bg-blue-300",
  secondary:
    "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-blue-700 disabled:text-slate-400",
  danger:
    "border-red-600 bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:border-red-300 disabled:bg-red-300",
  ghost:
    "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-blue-700 disabled:text-slate-400",
};

export function Button({
  children,
  className = "",
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-80",
        variantClassNames[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
