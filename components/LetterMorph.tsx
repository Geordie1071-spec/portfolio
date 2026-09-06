"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type LetterMorphProps = {
  text: string;
  className?: string;
};

type Slot = {
  from: string;
  to: string;
  morphing: boolean;
  key: string;
};

const MORPH_MS = 720;
const STAGGER_MS = 18;

function toChars(value: string, len: number) {
  const chars = Array.from(value.toUpperCase());
  while (chars.length < len) chars.push(" ");
  return chars.slice(0, len);
}

function buildSlots(fromText: string, toText: string, morphing: boolean): Slot[] {
  const len = Math.max(fromText.length, toText.length, 1);
  const from = toChars(fromText, len);
  const to = toChars(toText, len);
  return to.map((ch, i) => ({
    from: from[i] ?? " ",
    to: ch,
    morphing: morphing && (from[i] ?? " ") !== ch,
    key: `${i}-${from[i] ?? " "}-${ch}-${morphing ? "m" : "s"}`,
  }));
}

export default function LetterMorph({ text, className }: LetterMorphProps) {
  const normalized = text.toUpperCase();
  const [displayText, setDisplayText] = useState(normalized);
  const [slots, setSlots] = useState<Slot[]>(() => buildSlots("", normalized, true));
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (normalized !== displayText) {
    setDisplayText(normalized);
    setSlots(buildSlots(displayText, normalized, true));
  }

  useEffect(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    const trailing = Math.max(0, (normalized.length - 1) * STAGGER_MS);
    settleTimer.current = setTimeout(() => {
      setSlots(buildSlots(normalized, normalized, false));
    }, MORPH_MS + trailing + 40);
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [normalized]);

  return (
    <span
      className={`letter-morph${className ? ` ${className}` : ""}`}
      aria-label={normalized}
    >
      {slots.map((slot, index) => {
        const isSpace = slot.to === " " && (!slot.morphing || slot.from === " ");
        return (
          <span
            key={slot.key}
            className={`letter-slot${isSpace ? " is-space" : ""}${slot.morphing ? " is-morphing" : ""}`}
            style={{ "--delay": `${index * STAGGER_MS}ms` } as CSSProperties}
          >
            <span className="letter-stack">
              {slot.morphing ? (
                <span className="letter-char letter-from" aria-hidden="true">
                  {slot.from === " " ? "\u00A0" : slot.from}
                </span>
              ) : null}
              <span className="letter-char letter-to">
                {slot.to === " " ? "\u00A0" : slot.to}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
