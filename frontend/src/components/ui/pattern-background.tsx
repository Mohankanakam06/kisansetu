import React, { useId } from "react";
import { cn } from "@/components/ui";

export enum PATTERN_BACKGROUND_SPEED {
  Slow = "30s",
  Normal = "15s",
  Fast = "5s",
}

export interface BaseProps {
  animate?: boolean;
  direction?: keyof typeof DIRECTIONS;
  variant?: "dot" | "big-dot" | "grid";
  size?: "sm" | "md" | "lg";
  mask?: "ellipse-top" | "ellipse-bottom" | "ellipse" | "none";
  speed?: PATTERN_BACKGROUND_SPEED | string;
  className?: string;
  children?: React.ReactNode;
}

const DIRECTIONS = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
  "top-left": "to top left",
  "top-right": "to top right",
  "bottom-left": "to bottom left",
  "bottom-right": "to bottom right",
};

export function PatternBackground({
  animate = true,
  direction = "bottom",
  variant = "big-dot",
  size = "md",
  mask = "ellipse-top",
  speed = PATTERN_BACKGROUND_SPEED.Slow,
  className,
  children,
}: BaseProps) {
  const patternId = useId();

  const getPatternDimensions = () => {
    switch (size) {
      case "sm":
        return { width: 16, height: 16, r: 1 };
      case "lg":
        return { width: 48, height: 48, r: 3 };
      case "md":
      default:
        return { width: 32, height: 32, r: 2 };
    }
  };

  const { width, height, r } = getPatternDimensions();

  const maskStyles = {
    "ellipse-top": "radial-gradient(ellipse at top, black, transparent 70%)",
    "ellipse-bottom":
      "radial-gradient(ellipse at bottom, black, transparent 70%)",
    ellipse: "radial-gradient(ellipse at center, black, transparent 70%)",
    none: "none",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#F8FAFC] dark:bg-slate-950",
        className
      )}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitMaskImage: maskStyles[mask as keyof typeof maskStyles],
          maskImage: maskStyles[mask as keyof typeof maskStyles],
        }}
      >
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern
              id={patternId}
              width={width}
              height={height}
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
            >
              {variant === "dot" || variant === "big-dot" ? (
                <circle
                  cx={width / 2}
                  cy={height / 2}
                  r={variant === "big-dot" ? r * 1.5 : r}
                  className="fill-slate-200 dark:fill-slate-800"
                />
              ) : (
                <path
                  d={`M.5 ${height}V.5H${width}`}
                  fill="none"
                  strokeWidth="1"
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
              )}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>

        {/* Animation overlay */}
        {animate && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(${
                DIRECTIONS[direction as keyof typeof DIRECTIONS] || "to bottom"
              }, transparent, rgba(248, 250, 252, 0.4), transparent)`,
              backgroundSize: "200% 200%",
              animation: `pattern-slide ${speed} linear infinite`,
            }}
          />
        )}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
