"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import type { Project, ProjectPage } from "@/lib/projects";

type ProjectDetailProps = {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSwitch: (dir: number) => void;
  prevTitle: string;
  nextTitle: string;
};

function EmptyFrame({ cap, ph }: { cap: string; ph: string }) {
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
        <span className="detail-frame-ph">{ph}</span>
      </div>
      <div ref={lens} className="detail-frame-lens" aria-hidden="true" />
      <span className="detail-frame-cap">{cap}</span>
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
              transform: `translate(-50%, -50%) translateX(${off * 38}%) rotateY(${-off * 26}deg) translateZ(${-Math.abs(off) * 48}px)`,
              zIndex: 20 - Math.abs(Math.round(off * 10)),
            }}
          >
            <span>{pg.ph}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectDetail({
  project,
  open,
  onClose,
  onSwitch,
  prevTitle,
  nextTitle,
}: ProjectDetailProps) {
  const imgsRef = useRef<HTMLDivElement | null>(null);
  const imgsInnerRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  const destroyLenis = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    lenisRef.current?.destroy();
    lenisRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || !imgsRef.current || !imgsInnerRef.current) {
      destroyLenis();
      return;
    }
    destroyLenis();
    const lenis = new Lenis({
      wrapper: imgsRef.current,
      content: imgsInnerRef.current,
      duration: 1.15,
      smoothWheel: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    lenisRef.current = lenis;
    const raf = (t: number) => {
      lenis.raf(t);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    imgsRef.current.scrollTop = 0;
    return destroyLenis;
  }, [open, project?.title, destroyLenis]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (imgsRef.current) imgsRef.current.scrollTop = 0;
  }, [project?.title, open]);

  return (
    <div className={`detail-overlay${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button
        className="detail-peek prev"
        onClick={() => onSwitch(-1)}
        tabIndex={open ? 0 : -1}
        aria-label={`Previous project: ${prevTitle}`}
      />

      <article className="detail-card">
        <button className="overlay-x detail-x" onClick={onClose} aria-label="Close project" tabIndex={open ? 0 : -1}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {project && (
          <div className="detail-grid">
            <div className="detail-left">
              <h1>{project.title}</h1>
              <p className="detail-tagline">{project.tagline}</p>
              <div className="detail-meta">
                <a className="detail-link" href="#" aria-label="Open live project" tabIndex={open ? 0 : -1}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </a>
                <span className="detail-pill">{project.category}</span>
                <span className="detail-pill">{project.year}</span>
                <span className="detail-pill">{project.role}</span>
                <span className="detail-trophy" aria-hidden="true">🏆</span>
              </div>
            </div>
            <div className="detail-imgs" ref={imgsRef}>
              <div ref={imgsInnerRef}>
                <PageFan pages={project.pages} />
                {project.pages.map((pg) => (
                  <EmptyFrame key={pg.id} cap={pg.cap} ph={pg.ph} />
                ))}
              </div>
            </div>
          </div>
        )}
        <span className="detail-orb" aria-hidden="true" />
      </article>

      <button
        className="detail-peek next"
        onClick={() => onSwitch(1)}
        tabIndex={open ? 0 : -1}
        aria-label={`Next project: ${nextTitle}`}
      />
    </div>
  );
}
