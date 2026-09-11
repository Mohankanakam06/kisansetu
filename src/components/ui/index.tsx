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
    default: "bg-[#E2E4DE] text-[#1E1F1C] border-[#1E1F1C]",
    neutral: "bg-[#E2E4DE] text-[#1E1F1C] border-[#1E1F1C]",
    outline: "border-2 border-[#1E1F1C] text-[#1E1F1C] bg-transparent",
    success: "bg-[#d7e8db] text-[#112816] border-[#386641]",
    warning: "bg-[#faedd9] text-[#78350f] border-[#F4A261]",
    danger: "bg-[#fae8e0] text-[#491705] border-[#C04A22]",
    info: "bg-[#d9e9f2] text-[#082130] border-[#1B4965]",
    verified: "bg-[#d7e8db] text-[#112816] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
    gradeA: "bg-[#d7e8db] text-[#112816] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
    gradeB: "bg-[#faedd9] text-[#78350f] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
    gradeC: "bg-[#E2E4DE] text-[#1E1F1C] border-[#1E1F1C] font-bold",
    live: "bg-[#d7e8db] text-[#112816] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
    savings: "bg-[#fae8e0] text-[#C04A22] border-[#C04A22] font-black",
    farmer: "bg-[#fae8e0] text-[#C04A22] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
    buyer: "bg-[#d9e9f2] text-[#1B4965] border-[#1E1F1C] font-black shadow-[1.5px_1.5px_0_0_#1E1F1C]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
    md: "px-2.5 py-1 text-xs font-bold",
    lg: "px-3.5 py-1.5 text-sm font-black",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border-2 text-center transition-all",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#386641] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#386641]"></span>
        </span>
      )}
      {children}
    </span>
  );
}

// Button
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
    "inline-flex items-center justify-center rounded-sm font-bold transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E1F1C] cursor-pointer select-none border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]";

  const variants = {
    primary:
      "bg-[#C04A22] text-white hover:bg-[#a63d19] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    farmer:
      "bg-[#C04A22] text-white hover:bg-[#a63d19] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    buyer:
      "bg-[#1B4965] text-white hover:bg-[#153a50] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    forest:
      "bg-[#386641] text-white hover:bg-[#2c5234] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    glow:
      "bg-[#C04A22] text-white hover:bg-[#a63d19] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    secondary:
      "bg-[#FFFFFF] text-[#1E1F1C] hover:bg-[#EBECE8] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    outline:
      "border-2 border-[#1E1F1C] bg-transparent text-[#1E1F1C] hover:bg-[#EBECE8] shadow-none",
    ghost:
      "border-transparent shadow-none bg-transparent text-[#1E1F1C] hover:bg-[#E2E4DE] hover:border-[#1E1F1C]",
    danger:
      "bg-[#C04A22] text-white hover:bg-[#993414] hover:shadow-[3px_3px_0_0_#1E1F1C]",
    harvest:
      "bg-[#F4A261] text-[#1E1F1C] hover:bg-[#e8914b] hover:shadow-[3px_3px_0_0_#1E1F1C]",
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
    default: "bg-white border-2 border-[#1E1F1C] shadow-[3px_3px_0_0_#1E1F1C]",
    glass: "bg-white border-2 border-[#1E1F1C] shadow-[4px_4px_0_0_#1E1F1C]",
    elevated: "bg-white border-2 border-[#1E1F1C] shadow-[5px_5px_0_0_#1E1F1C]",
    interactive:
      "bg-white border-2 border-[#1E1F1C] shadow-[3px_3px_0_0_#1E1F1C] hover:shadow-[5px_5px_0_0_#1E1F1C] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-sm p-5",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
