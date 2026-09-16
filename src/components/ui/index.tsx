import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge Component
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
    | "savings"
    | "farmer"
    | "buyer";
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
    default: "bg-slate-100 text-slate-800 border-slate-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "border-slate-300 text-slate-700 bg-white",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
    verified: "bg-emerald-100/80 text-emerald-900 border-emerald-300 font-bold",
    gradeA: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    gradeB: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    gradeC: "bg-slate-100 text-slate-800 border-slate-300 font-semibold",
    live: "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold",
    savings: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    farmer: "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold",
    buyer: "bg-blue-50 text-blue-900 border-blue-200 font-bold",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-semibold tracking-tight",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border text-center transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
      )}
      {children}
    </span>
  );
}

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "harvest"
    | "glow"
    | "forest"
    | "farmer"
    | "buyer";
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
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 cursor-pointer select-none border text-center";

  const variants = {
    primary:
      "bg-emerald-800 text-white border-emerald-900/20 hover:bg-emerald-900 shadow-xs",
    farmer:
      "bg-emerald-800 text-white border-emerald-900/20 hover:bg-emerald-900 shadow-xs",
    buyer:
      "bg-slate-900 text-white border-slate-950 hover:bg-slate-800 shadow-xs",
    forest:
      "bg-emerald-800 text-white border-emerald-900/20 hover:bg-emerald-900 shadow-xs",
    glow:
      "bg-emerald-800 text-white border-emerald-900/20 hover:bg-emerald-900 shadow-sm",
    secondary:
      "bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs",
    outline:
      "border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 hover:text-slate-950 shadow-none",
    ghost:
      "border-transparent shadow-none bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    danger:
      "bg-rose-700 text-white border-rose-800 hover:bg-rose-800 shadow-xs",
    harvest:
      "bg-amber-600 text-white border-amber-700 hover:bg-amber-700 shadow-xs",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[36px]",
    md: "text-sm px-4 py-2 gap-2 min-h-[44px]",
    lg: "text-base px-6 py-2.5 gap-2.5 min-h-[48px]",
    icon: "h-10 w-10 p-0 min-h-[40px] min-w-[40px]",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
      )}
      {children}
    </button>
  );
}

// Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-white border border-slate-200/80 shadow-xs rounded-xl",
    glass: "bg-white border border-slate-200/80 shadow-xs rounded-xl",
    elevated: "bg-white border border-slate-200 shadow-sm rounded-xl",
    interactive:
      "bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all duration-200 rounded-xl cursor-pointer",
  };

  return (
    <div
      className={cn(
        "p-5 md:p-6",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, label, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 min-h-[44px]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500/20" : "border-slate-300",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Skeleton Loading Component
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}
