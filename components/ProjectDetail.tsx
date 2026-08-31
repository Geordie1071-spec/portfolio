"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import type { Project } from "@/lib/projects";

type ProjectDetailProps = {
  project: Project | null;
  open: boolean;
  onClose: () => void;
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

export default function ProjectDetail({ project, open, onClose }: ProjectDetailProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const destroyLenis = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    lenisRef.current?.destroy();
    lenisRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || !overlayRef.current || !contentRef.current) {
      destroyLenis();
      return;
    }
    destroyLenis();
    const lenis = new Lenis({
      wrapper: overlayRef.current,
      content: contentRef.current,
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
    overlayRef.current.scrollTop = 0;
    return destroyLenis;
  }, [open, project?.title, destroyLenis]);

  useEffect(() => {
    const g = gridRef.current;
    if (!open || !g) return;
    g.style.transition = "none";
    g.style.opacity = "0";
    g.style.transform = "translateY(16px)";
    const id = requestAnimationFrame(() => {
      g.style.transition = "opacity .32s ease, transform .4s cubic-bezier(.22,1.2,.32,1)";
      g.style.opacity = "1";
      g.style.transform = "translateY(0)";
    });
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (overlayRef.current) overlayRef.current.scrollTop = 0;
    return () => cancelAnimationFrame(id);
  }, [project?.title, open]);

  return (
    <div className={`detail-overlay${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div ref={overlayRef} className="detail-shell">
        <div ref={contentRef}>
        <button className="overlay-x detail-x" onClick={onClose} aria-label="Close project" tabIndex={open ? 0 : -1}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {project && (
          <div className="detail-grid" ref={gridRef}>
            <div className="detail-left">
              <div className="detail-meta">
                <span className="detail-pill">{project.category}</span>
                <span className="detail-year">{project.year}</span>
                <span className="detail-pill ghost">{project.role}</span>
              </div>
              <h1>{project.title}</h1>
              <p className="detail-tagline">{project.tagline}</p>
              <div className="detail-overview">
                {project.overview.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              <div className="detail-tools">
                {project.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
            <div className="detail-imgs">
              {project.pages.map((pg) => (
                <EmptyFrame key={pg.id} cap={pg.cap} ph={pg.ph} />
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
