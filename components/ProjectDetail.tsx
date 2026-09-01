"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import Lenis from "lenis";
import type { Project, ProjectPage } from "@/lib/projects";
import { useMobileDetail } from "@/lib/useMobileDetail";

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

function DetailLeft({
  project,
  summary,
  open,
  onClose,
  showClose,
}: {
  project: Project;
  summary?: string;
  open: boolean;
  onClose: () => void;
  showClose: boolean;
}) {
  return (
    <div className="detail-left">
      <div className="detail-left-head">
        <h1>{project.title}</h1>
        {showClose && (
          <button className="overlay-x detail-x" onClick={onClose} aria-label="Close project" tabIndex={open ? 0 : -1}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      <p className="detail-tagline">{project.tagline}</p>
      {summary && (
        <div className="detail-overview">
          <p>{summary}</p>
        </div>
      )}
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
  );
}

function DetailPageCycle({
  project,
  summary,
  open,
  onClose,
  copy,
}: {
  project: Project;
  summary?: string;
  open: boolean;
  onClose: () => void;
  copy: number;
}) {
  return (
    <div className="detail-page-cycle" data-cycle={copy}>
      <div className="detail-grid">
        <DetailLeft project={project} summary={summary} open={open} onClose={onClose} showClose={copy === 0} />
        <div className="detail-imgs detail-imgs-embedded">
          <div className="detail-imgs-stack">
            {project.pages.map((pg) => (
              <EmptyFrame key={`${copy}-${pg.id}`} cap={pg.cap} ph={pg.ph} img={pg.img} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameStack({ pages }: { pages: ProjectPage[] }) {
  return (
    <>
      {Array.from({ length: INFINITE_COPIES }, (_, copy) => (
        <div className="detail-imgs-cycle" data-cycle={copy} key={copy}>
          {pages.map((pg) => (
            <EmptyFrame key={`${copy}-${pg.id}`} cap={pg.cap} ph={pg.ph} img={pg.img} />
          ))}
        </div>
      ))}
    </>
  );
}

const SWITCH_OUT_MS = 420;
const SWITCH_IN_MS = 700;

const ProjectDetail = forwardRef<ProjectDetailHandle, ProjectDetailProps>(function ProjectDetail(
  { project, open, onClose, onSwitch, prevTitle, nextTitle },
  ref,
) {
  const isMobile = useMobileDetail();
  const pageScrollRef = useRef<HTMLDivElement | null>(null);
  const pageScrollInnerRef = useRef<HTMLDivElement | null>(null);
  const imgsRef = useRef<HTMLDivElement | null>(null);
  const imgsInnerRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const switchingRef = useRef(false);
  const openRef = useRef(open);
  const timersRef = useRef<number[]>([]);
  const isMobileRef = useRef(isMobile);

  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [dirClass, setDirClass] = useState<"dir-next" | "dir-prev">("dir-next");

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

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

  const measureCycle = useCallback(() => {
    const mobile = isMobileRef.current;
    const inner = mobile ? pageScrollInnerRef.current : imgsInnerRef.current;
    if (!inner) return 1;
    const selector = mobile ? ".detail-page-cycle" : ".detail-imgs-cycle";
    const cycle = inner.querySelector(selector) as HTMLElement | null;
    const h = cycle?.offsetHeight ?? inner.scrollHeight / INFINITE_COPIES;
    return Math.max(1, h);
  }, []);

  const readProgress = useCallback(() => {
    const mobile = isMobileRef.current;
    const wrap = mobile ? pageScrollRef.current : imgsRef.current;
    const inner = mobile ? pageScrollInnerRef.current : imgsInnerRef.current;
    const lenis = lenisRef.current;
    const cycleHeight = measureCycle();
    const scroll = lenis?.animatedScroll ?? wrap?.scrollTop ?? 0;

    if (mobile && inner && wrap) {
      const cycleEl = inner.querySelector(".detail-page-cycle") as HTMLElement | null;
      const imgs = inner.querySelector(".detail-imgs-embedded") as HTMLElement | null;
      if (cycleEl && imgs) {
        const cycleIndex = Math.floor(scroll / cycleHeight);
        const cycleScroll = scroll - cycleIndex * cycleHeight;
        const imgsTop = imgs.offsetTop;
        const relative = cycleScroll - imgsTop;
        const viewport = wrap.clientHeight;
        const scrollable = Math.max(1, imgs.offsetHeight - viewport * 0.25);
        const wrapped = ((relative % scrollable) + scrollable) % scrollable;
        applyProgress(Math.min(1, Math.max(0, wrapped / scrollable)));
        return;
      }
    }

    if (lenis && wrap) {
      const viewport = wrap.clientHeight;
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
    const mobile = isMobile;
    const wrapper = mobile ? pageScrollRef.current : imgsRef.current;
    const content = mobile ? pageScrollInnerRef.current : imgsInnerRef.current;

    if (!open || !wrapper || !content) {
      destroyLenis();
      applyProgress(0);
      return;
    }

    destroyLenis();
    const lenis = new Lenis({
      wrapper,
      content,
      infinite: true,
      syncTouch: true,
      syncTouchLerp: 0.12,
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 0.58,
      touchMultiplier: 0.72,
      touchInertiaExponent: 1.45,
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
    applyProgress(0);

    return () => {
      wrapper.removeEventListener("scroll", onScroll);
      lenis.off("scroll", onScroll);
      destroyLenis();
    };
  }, [open, project?.title, isMobile, destroyLenis, applyProgress, readProgress]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (pageScrollRef.current) pageScrollRef.current.scrollTop = 0;
    if (imgsRef.current) imgsRef.current.scrollTop = 0;
    applyProgress(0);
  }, [project?.title, open, isMobile, applyProgress]);

  useEffect(() => {
    const mobile = isMobile;
    const wrap = mobile ? pageScrollRef.current : imgsRef.current;
    if (!open || !wrap) return;

    let dragging = false;
    let startY = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest(".detail-x, .detail-link, .detail-peek")) return;
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
  }, [open, project?.title, isMobile]);

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
  const summary = project?.overview[0];

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

      <article className={`detail-card${switchClass}${switchClass ? ` ${dirClass}` : ""}${isMobile ? " is-mobile" : ""}`}>
        {project && (
          <div className="detail-card-scroll" ref={pageScrollRef}>
            <div className="detail-scroll-inner" ref={pageScrollInnerRef}>
              {isMobile ? (
                Array.from({ length: INFINITE_COPIES }, (_, copy) => (
                  <DetailPageCycle
                    key={copy}
                    copy={copy}
                    project={project}
                    summary={summary}
                    open={open}
                    onClose={handleClose}
                  />
                ))
              ) : (
                <div className="detail-grid">
                  <DetailLeft project={project} summary={summary} open={open} onClose={handleClose} showClose />
                  <div className="detail-imgs" ref={imgsRef}>
                    <div ref={imgsInnerRef}>
                      <FrameStack pages={project.pages} />
                    </div>
                  </div>
                </div>
              )}
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
