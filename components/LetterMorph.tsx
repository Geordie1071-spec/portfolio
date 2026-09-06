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

export default function LetterMorph({ text, className, style }: LetterMorphProps) {
  const normalized = text.toUpperCase();
  const [displayText, setDisplayText] = useState(normalized);
  const [slots, setSlots] = useState<Slot[]>(() => buildSlots("", normalized, true));
  const [morphing, setMorphing] = useState(true);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [fitScale, setFitScale] = useState(1);

  if (normalized !== displayText) {
    setDisplayText(normalized);
    setMorphing(true);
    setSlots(buildSlots(displayText, normalized, true));
  }

  useEffect(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    const trailing = Math.max(0, (normalized.length - 1) * STAGGER_MS);
    settleTimer.current = setTimeout(() => {
      setSlots(buildSlots(normalized, normalized, false));
      setMorphing(false);
    }, MORPH_MS + trailing + 40);
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [normalized]);

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
      const next = Math.min(1, (available * 0.98) / needed);
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
  }, [normalized, slots, morphing]);

  return (
    <span
      ref={rootRef}
      className={`letter-morph${morphing ? " is-morphing" : " is-settled"}${className ? ` ${className}` : ""}`}
      style={{ ...style, ["--fit-scale" as string]: String(fitScale) }}
      aria-label={normalized}
    >
      {/* Settled: one text run so Thunder ExtraBoldLC gets real tracking/kerning */}
      {!morphing ? (
        <span className="letter-solid">{normalized}</span>
      ) : (
        slots.map((slot, index) => {
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
        })
      )}
    </span>
  );
}
