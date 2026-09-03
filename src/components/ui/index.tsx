import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline"
    | "gradeA"
    | "gradeB"
    | "gradeC"
    | "verified";
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
    default: "bg-slate-100 text-slate-700 border-slate-300",
    neutral: "bg-slate-100 text-slate-700 border-slate-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold",
    warning: "bg-amber-100 text-amber-900 border-amber-200 font-semibold",
    danger: "bg-red-100 text-red-800 border-red-200 font-semibold",
    info: "bg-blue-100 text-blue-800 border-blue-200 font-semibold",
    outline: "bg-transparent text-slate-700 border-slate-300",
    gradeA: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    gradeB: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    gradeC: "bg-slate-100 text-slate-700 border-slate-300 font-bold",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-caption font-medium",
    md: "px-2.5 py-1 text-caption font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border text-center transition-all",
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
    "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer select-none";

  const variants = {
    primary:
      "bg-emerald-800 text-white font-bold hover:bg-emerald-900 shadow-md shadow-emerald-950/20 hover:shadow-lg active:scale-[0.98]",
    secondary:
      "bg-white text-slate-800 border border-slate-300 font-semibold hover:bg-slate-50 hover:border-emerald-600 active:bg-slate-100",
    outline:
      "border border-emerald-800 bg-transparent text-emerald-900 font-bold hover:bg-emerald-50 hover:border-emerald-900",
    ghost:
      "bg-transparent text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900",
    danger:
      "bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm active:scale-[0.98]",
    harvest:
      "bg-amber-500 text-slate-950 font-black hover:bg-amber-600 shadow-sm shadow-amber-900/20 active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-xs px-3.5 py-2 gap-1.5 h-9 rounded-lg font-bold",
    md: "text-sm px-4 py-2.5 gap-2 h-10 rounded-xl font-bold",
    lg: "text-base px-6 py-3 gap-2.5 h-12 font-bold rounded-xl",
    icon: "h-9 w-9 p-0 rounded-xl",
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
        "rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-card",
        hoverEffect && "transition-colors duration-200 hover:border-primary/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
