"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import Lenis from "lenis";
import type { Project, ProjectPage } from "@/lib/projects";

export type ProjectDetailHandle = {
  navigate: (dir: number) => void;
};

type ProjectDetailProps = {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSwitch: (dir: number) => void;
  prevTitle: string;
  nextTitle: string;
};

function EmptyFrame({ cap, ph, img }: { cap: string; ph: string; img?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const fine = useRef(true);

  useEffect(() => {
    fine.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fine.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    ref.current.style.setProperty("--bx", `${x}%`);
    ref.current.style.setProperty("--by", `${y}%`);
    if (lens.current) {
      lens.current.style.left = `${x}%`;
      lens.current.style.top = `${y}%`;
    }
  };

  return (
    <div
      ref={ref}
      className={`detail-frame${hot ? " is-hot" : ""}`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onMouseMove={onMove}
    >
      <div className="detail-frame-inner">
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element -- local placeholder assets */
          <img className="detail-frame-img" src={img} alt={cap} draggable={false} />
        ) : (
          <span className="detail-frame-ph">{ph}</span>
        )}
      </div>
      <div ref={lens} className="detail-frame-lens" aria-hidden="true" />
      <span className="detail-frame-cap">{cap}</span>
    </div>
  );
}

const INFINITE_COPIES = 2;

function DetailFrames({ pages, copy }: { pages: ProjectPage[]; copy: number }) {
  return (
    <div className="detail-imgs-cycle" data-cycle={copy}>
      <PageFan pages={pages} />
      {pages.map((pg) => (
        <EmptyFrame key={`${copy}-${pg.id}`} cap={pg.cap} ph={pg.ph} img={pg.img} />
      ))}
    </div>
  );
}
function PageFan({ pages }: { pages: ProjectPage[] }) {
  const n = pages.length;
  const mid = (n - 1) / 2;
  return (
    <div className="detail-fan" aria-hidden={n === 0}>
      {pages.map((pg, i) => {
        const off = i - mid;
        return (
          <div
            key={pg.id}
            className="detail-fan-card"
            style={{
              transform: `translate(-50%, -50%) translateX(${off * 155}px) rotateY(${-off * 38}deg) translateZ(${-Math.abs(off) * 70}px) scale(${1 - Math.abs(off) * 0.06})`,
              zIndex: 20 - Math.abs(Math.round(off * 10)),
            }}
          >
            {pg.img ? (
              /* eslint-disable-next-line @next/next/no-img-element -- local placeholder assets */
              <img className="detail-fan-img" src={pg.img} alt="" draggable={false} />
            ) : (
              <span>{pg.ph}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SWITCH_OUT_MS = 420;
const SWITCH_IN_MS = 700;

const ProjectDetail = forwardRef<ProjectDetailHandle, ProjectDetailProps>(function ProjectDetail(
  { project, open, onClose, onSwitch, prevTitle, nextTitle },
  ref,
) {
  const imgsRef = useRef<HTMLDivElement | null>(null);
  const imgsInnerRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const switchingRef = useRef(false);
  const openRef = useRef(open);
  const timersRef = useRef<number[]>([]);

  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [dirClass, setDirClass] = useState<"dir-next" | "dir-prev">("dir-next");

  const resetSwitch = useCallback(() => {
    switchingRef.current = false;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setPhase("idle");
  }, []);

  useEffect(() => {
    openRef.current = open;
    if (!open) {
      switchingRef.current = false;
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      switchingRef.current = false;
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      setPhase("idle");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const applyProgress = useCallback((progress: number) => {
    const n = fillRefs.current.length;
    const p = ((progress % 1) + 1) % 1;
    for (let i = 0; i < n; i++) {
      const el = fillRefs.current[i];
      if (!el) continue;
      const fill = n === 0 ? 0 : Math.min(1, Math.max(0, p * n - i));
      el.style.transform = `scaleX(${fill})`;
    }
  }, []);

  const cycleHeightRef = useRef(1);

  const measureCycle = useCallback(() => {
    const inner = imgsInnerRef.current;
    if (!inner) return 1;
    const cycle = inner.querySelector(".detail-imgs-cycle") as HTMLElement | null;
    const h = cycle?.offsetHeight ?? inner.scrollHeight / INFINITE_COPIES;
    cycleHeightRef.current = Math.max(1, h);
    return cycleHeightRef.current;
  }, []);

  const readProgress = useCallback(() => {
    const wrap = imgsRef.current;
    const lenis = lenisRef.current;
    const cycleHeight = measureCycle();
    if (lenis) {
      const viewport = wrap?.clientHeight ?? 1;
      const scrollable = Math.max(1, cycleHeight - viewport);
      const wrapped = ((lenis.animatedScroll % cycleHeight) + cycleHeight) % cycleHeight;
      applyProgress(wrapped / scrollable);
      return;
    }
    if (!wrap) {
      applyProgress(0);
      return;
    }
    const viewport = wrap.clientHeight;
    const scrollable = Math.max(1, cycleHeight - viewport);
    const wrapped = ((wrap.scrollTop % cycleHeight) + cycleHeight) % cycleHeight;
    applyProgress(wrapped / scrollable);
  }, [applyProgress, measureCycle]);

  const destroyLenis = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    lenisRef.current?.destroy();
    lenisRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || !imgsRef.current || !imgsInnerRef.current) {
      destroyLenis();
      applyProgress(0);
      return;
    }
    destroyLenis();
    const wrapper = imgsRef.current;
    const lenis = new Lenis({
      wrapper,
      content: imgsInnerRef.current,
      infinite: true,
      syncTouch: true,
      syncTouchLerp: 0.055,
      lerp: 0.055,
      smoothWheel: true,
      wheelMultiplier: 0.28,
      touchMultiplier: 0.38,
      touchInertiaExponent: 1.55,
    });
    lenisRef.current = lenis;
    const onScroll = () => readProgress();
    lenis.on("scroll", onScroll);
    wrapper.addEventListener("scroll", onScroll, { passive: true });
    const raf = (t: number) => {
      lenis.raf(t);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    wrapper.scrollTop = 0;
    measureCycle();
    applyProgress(0);
    return () => {
      wrapper.removeEventListener("scroll", onScroll);
      lenis.off("scroll", onScroll);
      destroyLenis();
    };
  }, [open, project?.title, destroyLenis, applyProgress, readProgress, measureCycle]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (imgsRef.current) imgsRef.current.scrollTop = 0;
    applyProgress(0);
  }, [project?.title, open, applyProgress]);

  useEffect(() => {
    const wrap = imgsRef.current;
    if (!open || !wrap) return;

    let dragging = false;
    let startY = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      startY = e.clientY;
      startScroll = lenisRef.current?.animatedScroll ?? wrap.scrollTop;
      wrap.setPointerCapture(e.pointerId);
      wrap.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const target = startScroll - (e.clientY - startY);
      if (lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true });
      else wrap.scrollTop = target;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove("is-dragging");
      if (wrap.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId);
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.classList.remove("is-dragging");
    };
  }, [open, project?.title]);

  const requestSwitch = useCallback(
    (dir: number) => {
      if (!openRef.current || switchingRef.current) return;
      switchingRef.current = true;
      setDirClass(dir > 0 ? "dir-next" : "dir-prev");
      setPhase("out");
      const outId = window.setTimeout(() => {
        onSwitch(dir);
        setPhase("in");
        const inId = window.setTimeout(() => {
          setPhase("idle");
          switchingRef.current = false;
        }, SWITCH_IN_MS);
        timersRef.current.push(inId);
      }, SWITCH_OUT_MS);
      timersRef.current.push(outId);
    },
    [onSwitch],
  );

  useImperativeHandle(ref, () => ({ navigate: requestSwitch }), [requestSwitch]);

  const handleClose = () => {
    resetSwitch();
    onClose();
  };

  const visualPhase = open ? phase : "idle";
  const switchClass =
    visualPhase === "out" ? " is-switching-out" : visualPhase === "in" ? " is-switching-in" : "";
  const pillCount = project?.pages.length ?? 0;

  return (
    <div className={`detail-overlay${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button
        className="detail-peek prev"
        onClick={() => requestSwitch(-1)}
        tabIndex={open ? 0 : -1}
        aria-label={`Previous project: ${prevTitle}`}
      >
        <span className="detail-peek-inner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="detail-peek-title">{prevTitle}</span>
        </span>
      </button>

      <article className={`detail-card${switchClass}${switchClass ? ` ${dirClass}` : ""}`}>
        <button className="overlay-x detail-x" onClick={handleClose} aria-label="Close project" tabIndex={open ? 0 : -1}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {project && (
          <div className="detail-grid">
            <div className="detail-left">
              <h1>{project.title}</h1>
              <p className="detail-tagline">{project.tagline}</p>
              <div className="detail-overview">
                {project.overview.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
              <div className="detail-meta">
                <a className="detail-link" href="#" aria-label="Open live project" tabIndex={open ? 0 : -1}>
                  <span className="detail-link-icon" aria-hidden="true">
                    <svg className="detail-link-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                  </span>
                </a>
                <span className="detail-pill">{project.category}</span>
                <span className="detail-pill">{project.year}</span>
                <span className="detail-pill">{project.role}</span>
              </div>
            </div>
            <div className="detail-imgs" ref={imgsRef}>
              <div ref={imgsInnerRef}>
                {Array.from({ length: INFINITE_COPIES }, (_, copy) => (
                  <DetailFrames key={copy} pages={project.pages} copy={copy} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="detail-progress" aria-hidden="true">
          {Array.from({ length: pillCount }, (_, i) => (
            <span key={`${project?.title ?? "p"}-${i}`} className="detail-progress-pill">
              <span
                className="detail-progress-pill-fill"
                ref={(el) => {
                  fillRefs.current[i] = el;
                  fillRefs.current.length = pillCount;
                }}
              />
            </span>
          ))}
        </div>
      </article>

      <button
        className="detail-peek next"
        onClick={() => requestSwitch(1)}
        tabIndex={open ? 0 : -1}
        aria-label={`Next project: ${nextTitle}`}
      >
        <span className="detail-peek-inner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="detail-peek-title">{nextTitle}</span>
        </span>
      </button>
    </div>
  );
});

export default ProjectDetail;
