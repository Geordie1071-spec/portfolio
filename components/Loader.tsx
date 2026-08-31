"use client";

import { useEffect, useRef, useState } from "react";
import { FOOTER_SCATTER, LOGO_PATHS } from "@/lib/logoPaths";

const SHARD_ORDER = [4, 0, 7, 2, 5, 1, 6, 3];
const APPEAR_STAGGER = 160;
const APPEAR_MS = 520;
const HOLD_MS = 480;
const IRIS_MS = 1100;

function reducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setGone(true);
      onComplete();
    };

    if (reducedMotion()) {
      const t = window.setTimeout(finish, 420);
      return () => window.clearTimeout(t);
    }

    const lastAppear = (LOGO_PATHS.length - 1) * APPEAR_STAGGER + APPEAR_MS;
    let raf = 0;
    const irisT = window.setTimeout(() => {
      const start = performance.now();
      const max = Math.hypot(window.innerWidth, window.innerHeight) * 1.15;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / IRIS_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        rootRef.current?.style.setProperty("--iris", `${eased * max}px`);
        if (t < 1) raf = requestAnimationFrame(step);
        else finish();
      };
      raf = requestAnimationFrame(step);
    }, lastAppear + HOLD_MS);

    return () => {
      window.clearTimeout(irisT);
      cancelAnimationFrame(raf);
    };
  }, [onComplete]);

  if (gone) return null;

  return (
    <div ref={rootRef} className="site-loader" aria-hidden="true">
      <svg className="site-loader-mark" viewBox="0 0 97 70" fill="#eaf7ff" xmlns="http://www.w3.org/2000/svg">
        {LOGO_PATHS.map((d, i) => {
          const order = SHARD_ORDER.indexOf(i);
          const delay = order * APPEAR_STAGGER;
          const scatter = FOOTER_SCATTER[i % 8];
          return (
            <path
              key={i}
              fillRule="evenodd"
              clipRule="evenodd"
              d={d}
              style={{
                ["--delay" as string]: `${delay}ms`,
                ["--from-x" as string]: `${scatter[0] * 0.55}px`,
                ["--from-y" as string]: `${scatter[1] * 0.55}px`,
                ["--from-r" as string]: `${scatter[2] * 0.7}deg`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
