import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "gradeA" | "gradeB" | "gradeC";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-soil-100 text-soil-800 border-soil-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10",
    warning: "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/10",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10",
    outline: "bg-transparent text-soil-700 border-soil-300",
    gradeA: "bg-emerald-600 text-white font-bold tracking-wider shadow-sm",
    gradeB: "bg-amber-500 text-white font-bold tracking-wider shadow-sm",
    gradeC: "bg-stone-500 text-white font-bold tracking-wider shadow-sm",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border text-center transition-all",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "harvest";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:bg-emerald-800",
    secondary:
      "bg-soil-100 text-soil-900 hover:bg-soil-200 active:bg-soil-300 border border-soil-200",
    outline:
      "border border-soil-300 bg-transparent text-soil-800 hover:bg-soil-50 hover:border-soil-400 active:bg-soil-100",
    ghost: "bg-transparent text-soil-700 hover:bg-soil-100 hover:text-soil-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    harvest:
      "bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow active:bg-amber-800",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 h-8",
    md: "text-sm px-4 py-2 gap-2 h-10",
    lg: "text-base px-6 py-2.5 gap-2.5 h-12 font-semibold",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-soil-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        hoverEffect &&
          "transition-all duration-200 hover:border-emerald-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
