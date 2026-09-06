"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type LetterMorphProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

type Slot = {
  from: string;
  to: string;
  morphing: boolean;
  key: string;
};

const MORPH_MS = 620;
const STAGGER_MS = 36;

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
    key: `s${i}`,
  }));
}

export default function LetterMorph({ text, className, style }: LetterMorphProps) {
  const normalized = text.toUpperCase();
  const shownRef = useRef(normalized);
  const [fromText, setFromText] = useState(normalized);
  const [toText, setToText] = useState(normalized);
  const [morphing, setMorphing] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    if (normalized === shownRef.current) return;

    const from = shownRef.current;
    setFromText(from);
    setToText(normalized);
    setMorphing(true);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    const trailing = Math.max(0, (Math.max(from.length, normalized.length) - 1) * STAGGER_MS);
    settleTimer.current = setTimeout(() => {
      shownRef.current = normalized;
      setFromText(normalized);
      setMorphing(false);
    }, MORPH_MS + trailing + 50);

    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [normalized]);

  const slots = buildSlots(fromText, toText, morphing);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const fit = () => {
      el.style.setProperty("--fit-scale", "1");
      const parent = el.parentElement;
      if (!parent) return;
      const available = parent.clientWidth;
      const needed = el.scrollWidth;
      if (!available || !needed) {
        setFitScale(1);
        return;
      }
      const next = Math.min(1, (available * 0.96) / needed);
      setFitScale(next);
      el.style.setProperty("--fit-scale", String(next));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", fit);
    document.fonts?.ready?.then(fit).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [toText, fromText, morphing]);

  return (
    <span
      ref={rootRef}
      className={`letter-morph${morphing ? " is-morphing" : " is-settled"}${className ? ` ${className}` : ""}`}
      style={{ ...style, ["--fit-scale" as string]: String(fitScale) }}
      aria-label={normalized}
    >
      {slots.map((slot, index) => {
        const isSpace = slot.to === " " && slot.from === " ";
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
