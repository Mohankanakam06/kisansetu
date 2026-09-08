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
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "verified"
    | "gradeA"
    | "gradeB"
    | "gradeC"
    | "live"
    | "savings";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "border border-slate-200 text-slate-600 bg-transparent",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    verified: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    gradeA: "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold shadow-xs",
    gradeB: "bg-amber-100 text-amber-950 border-amber-300 font-bold shadow-xs",
    gradeC: "bg-slate-100 text-slate-800 border-slate-200",
    live: "bg-emerald-500/15 text-emerald-800 border-emerald-300 font-bold",
    savings: "bg-amber-500/15 text-amber-900 border-amber-300 font-extrabold",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border text-center transition-all",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
      )}
      {children}
    </span>
  );
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "harvest" | "glow" | "forest";
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
    "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer select-none";

  const variants = {
    primary:
      "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm hover:shadow-md",
    forest:
      "bg-[#005f39] text-white hover:bg-[#004a2c] shadow-sm hover:shadow-md",
    glow:
      "bg-gradient-to-r from-emerald-700 to-[#005f39] text-white shadow-glow hover:shadow-glow-emerald hover:brightness-105 border border-emerald-500/30",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs",
    outline:
      "border-2 border-emerald-700 bg-transparent text-emerald-800 hover:bg-emerald-50/80",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-xs",
    harvest:
      "bg-amber-600 text-white hover:bg-amber-700 shadow-xs hover:shadow-glow-amber",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
    md: "text-sm px-4 py-2 gap-2 h-10",
    lg: "text-base px-6 py-3 gap-2.5 h-12",
    icon: "h-10 w-10 p-0",
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
  variant?: "default" | "glass" | "elevated" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-white border-slate-200/90 shadow-card",
    glass: "glass-panel border-white/40 shadow-card-elevated",
    elevated: "bg-white border-slate-200 shadow-card-elevated hover:shadow-card-hover transition-all duration-300",
    interactive: "bg-white border-slate-200 shadow-card hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
