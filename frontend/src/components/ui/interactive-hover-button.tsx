import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/components/ui";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  wide?: boolean;
  variant?:
    | "primary"
    | "farmer"
    | "buyer"
    | "harvest"
    | "secondary"
    | "solid-primary";
  icon?: React.ReactNode;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = "Button",
      wide = false,
      variant = "primary",
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const content = children || text;

    const variantStyles = {
      primary: {
        button:
          "border-emerald-300/90 bg-white text-emerald-950 hover:border-emerald-800 shadow-2xs",
        dot: "bg-emerald-800",
        hoverText: "text-white",
      },
      farmer: {
        button:
          "border-emerald-300/90 bg-white text-emerald-950 hover:border-emerald-800 shadow-2xs",
        dot: "bg-emerald-800",
        hoverText: "text-white",
      },
      buyer: {
        button:
          "border-slate-300 bg-white text-slate-900 hover:border-slate-900 shadow-2xs",
        dot: "bg-slate-900",
        hoverText: "text-white",
      },
      harvest: {
        button:
          "border-amber-300 bg-white text-amber-950 hover:border-amber-700 shadow-2xs",
        dot: "bg-amber-600",
        hoverText: "text-white",
      },
      secondary: {
        button:
          "border-slate-300 bg-white text-slate-800 hover:border-slate-800 shadow-2xs",
        dot: "bg-slate-800",
        hoverText: "text-white",
      },
      "solid-primary": {
        button:
          "border-emerald-900/40 bg-emerald-800 text-white hover:border-emerald-950 shadow-xs",
        dot: "bg-emerald-950",
        hoverText: "text-emerald-100",
      },
    };

    const selectedVariant = variantStyles[variant] || variantStyles.primary;

    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border px-6 py-2.5 text-center text-sm font-semibold transition-all duration-300 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none min-h-[44px]",
          selectedVariant.button,
          wide ? "min-w-56" : "w-auto",
          className
        )}
        {...props}
      >
        {/* Idle State Content */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
              selectedVariant.dot
            )}
          />
          <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {content}
          </span>
        </div>

        {/* Hover State Animated Content */}
        <div
          className={cn(
            "absolute inset-0 z-10 flex h-full w-full items-center justify-center gap-2 opacity-0 transition-all duration-300 translate-x-12 group-hover:translate-x-0 group-hover:opacity-100",
            selectedVariant.hoverText
          )}
        >
          <span>{content}</span>
          {icon ? icon : <ArrowRight className="h-4 w-4" />}
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
