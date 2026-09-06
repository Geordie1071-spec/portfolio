"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type LetterMorphProps = {
  names: string[];
  active: string;
  className?: string;
};

type Phase = "on" | "leave" | "wait";

const ROLL_MS = 560;
const STAGGER_MS = 32;

function chars(value: string) {
  return Array.from(value.toUpperCase());
}

export default function LetterMorph({ names, active, className }: LetterMorphProps) {
  const lines = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of names) {
      const key = name.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
    return out;
  }, [names]);

  const current = active.toUpperCase();
  const longest = useMemo(
    () => lines.reduce((best, name) => (name.length > best.length ? name : best), current),
    [lines, current],
  );

  const prevRef = useRef(current);
  const [phase, setPhase] = useState<Record<string, Phase>>(() => {
    const init: Record<string, Phase> = {};
    for (const name of lines) init[name] = name === current ? "on" : "wait";
    return init;
  });

  useEffect(() => {
    setPhase((prev) => {
      const next = { ...prev };
      for (const name of lines) {
        if (!(name in next)) next[name] = name === current ? "on" : "wait";
      }
      return next;
    });
  }, [lines, current]);

  useEffect(() => {
    if (current === prevRef.current) return;
    const outgoing = prevRef.current;
    prevRef.current = current;

    setPhase((prev) => ({
      ...prev,
      [outgoing]: "leave",
      [current]: "wait",
    }));

    let enterFrame = 0;
    const prep = requestAnimationFrame(() => {
      enterFrame = requestAnimationFrame(() => {
        setPhase((prev) => ({ ...prev, [current]: "on" }));
      });
    });

    const reset = window.setTimeout(
      () => {
        setPhase((prev) => ({ ...prev, [outgoing]: "wait" }));
      },
      ROLL_MS + outgoing.length * STAGGER_MS + 40,
    );

    return () => {
      cancelAnimationFrame(prep);
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(reset);
    };
  }, [current]);

  return (
    <h1
      className={`home-title${className ? ` ${className}` : ""}`}
      aria-label={current}
    >
      <span className="home-title-sizer" aria-hidden="true">
        {longest}
      </span>
      {lines.map((name) => {
        const state = phase[name] ?? (name === current ? "on" : "wait");
        return (
          <span
            key={name}
            className={`home-title-line is-${state}`}
            aria-hidden={name !== current}
          >
            {chars(name).map((ch, index) => (
              <span
                key={`${name}-${index}`}
                className={`letter-slot${ch === " " ? " is-space" : ""}`}
                style={{ "--i": index } as CSSProperties}
              >
                <span className="letter-char">{ch === " " ? "\u00A0" : ch}</span>
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
