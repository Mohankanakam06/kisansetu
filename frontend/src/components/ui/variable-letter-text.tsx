"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface VariableLetterTextProps {
  label: string;
  className?: string;
  duration?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  fromFontWeight?: number;
  toFontWeight?: number;
  interactive?: boolean;
}

export const VariableLetterText: React.FC<VariableLetterTextProps> = ({
  label,
  className,
  duration = 0.6,
  staggerDuration = 0.025,
  staggerFrom = "first",
  fromFontWeight = 700,
  toFontWeight = 900,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Split label into words, and words into characters to prevent awkward line breaks
  const words = label.split(" ");
  const totalChars = label.replace(/\s+/g, "").length;

  let globalCharIndex = 0;

  const getDelay = (charIndex: number): number => {
    if (staggerFrom === "last") {
      return (totalChars - 1 - charIndex) * staggerDuration;
    }
    if (staggerFrom === "center") {
      const center = (totalChars - 1) / 2;
      return Math.abs(charIndex - center) * staggerDuration;
    }
    return charIndex * staggerDuration;
  };

  return (
    <span
      className={cn("inline-block cursor-default select-none", className)}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onTouchStart={() => interactive && setIsHovered((prev) => !prev)}
    >
      {words.map((word, wordIdx) => {
        const letters = Array.from(word);
        return (
          <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
            {letters.map((char, charIdx) => {
              const delay = getDelay(globalCharIndex);
              globalCharIndex++;

              return (
                <span
                  key={`char-${wordIdx}-${charIdx}`}
                  className="inline-block transition-all"
                  style={{
                    fontWeight: isHovered ? toFontWeight : fromFontWeight,
                    transitionDuration: `${duration}s`,
                    transitionDelay: `${delay}s`,
                    transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)",
                    transform: isHovered ? "translateY(-1px)" : "translateY(0px)",
                    willChange: "font-weight, transform",
                  }}
                >
                  {char}
                </span>
              );
            })}
            {wordIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default VariableLetterText;
