"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FOOTER_SCATTER, LOGO_PATHS } from "@/lib/logoPaths";

const SHARD_ORDER = [4, 0, 7, 2, 5, 1, 6, 3];
const APPEAR_STAGGER = 130;
const APPEAR_MS = 720;
const HOLD_MS = 70;
const IRIS_MS = 2200;
const SCENE_WAIT_MS = 520;

function reducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function irisEase(t: number) {
  return t * t * (3 - 2 * t);
}

type LoaderProps = {
  onComplete: () => void;
  sceneReadyRef: RefObject<boolean>;
};

export default function Loader({ onComplete, sceneReadyRef }: LoaderProps) {
  const [gone, setGone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setExiting(true);
      window.setTimeout(() => {
        setGone(true);
        onComplete();
      }, 280);
    };

    if (reducedMotion()) {
      const t = window.setTimeout(finish, 420);
      return () => window.clearTimeout(t);
    }

    const lastAppear = (LOGO_PATHS.length - 1) * APPEAR_STAGGER + APPEAR_MS;
    let raf = 0;
    let holdT = 0;
    let irisStarted = false;

    const startIris = () => {
      if (irisStarted) return;
      irisStarted = true;
      const start = performance.now();
      const max = Math.hypot(window.innerWidth, window.innerHeight) * 1.12;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / IRIS_MS);
        rootRef.current?.style.setProperty("--iris", `${irisEase(t) * max}px`);
        if (t < 1) raf = requestAnimationFrame(step);
        else finish();
      };
      raf = requestAnimationFrame(step);
    };

    const tryReveal = () => {
      if (irisStarted) return;
      const pollStart = performance.now();
      const poll = () => {
        if (irisStarted) return;
        if (sceneReadyRef.current || performance.now() - pollStart > SCENE_WAIT_MS) {
          holdT = window.setTimeout(startIris, HOLD_MS);
          return;
        }
        raf = requestAnimationFrame(poll);
      };
      poll();
    };

    const assembleT = window.setTimeout(tryReveal, lastAppear);

    return () => {
      window.clearTimeout(assembleT);
      window.clearTimeout(holdT);
      cancelAnimationFrame(raf);
    };
  }, [onComplete, sceneReadyRef]);

  if (gone) return null;

  return (
    <div ref={rootRef} className={`site-loader${exiting ? " is-exiting" : ""}`} aria-hidden="true">
      <svg className="site-loader-mark" viewBox="0 0 97 70" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
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
                ["--appear-ms" as string]: `${APPEAR_MS}ms`,
                ["--from-x" as string]: `${scatter[0] * 0.42}px`,
                ["--from-y" as string]: `${scatter[1] * 0.42}px`,
                ["--from-r" as string]: `${scatter[2] * 0.45}deg`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
