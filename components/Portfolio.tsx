"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import LogoIcon from "./LogoIcon";
import ProfilePanel from "./ProfilePanel";
import ProjectDetail, { type ProjectDetailHandle } from "./ProjectDetail";
import { projects } from "@/lib/projects";
import type { ProjectCarouselHandle } from "./ProjectCarousel";

const ProjectCarousel = dynamic(() => import("./ProjectCarousel"), { ssr: false });

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const detailOpen = detailIdx != null;

  const carouselRef = useRef<ProjectCarouselHandle>(null);
  const detailRef = useRef<ProjectDetailHandle>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(true);
  const detailOpenRef = useRef(false);
  const profileOpenRef = useRef(false);

  const anim = useRef({
    mx: 0, my: 0, cx: 0, cy: 0,
    cursorSeen: false, cursorHot: false, cursorBreak: false,
    breakT: undefined as ReturnType<typeof setTimeout> | undefined,
  }).current;

  const onLoaderDone = useCallback(() => {
    loadingRef.current = false;
    setLoading(false);
  }, []);

  const closeOverlays = useCallback(() => {
    setProfileOpen(false);
    setDetailIdx(null);
    profileOpenRef.current = false;
    detailOpenRef.current = false;
  }, []);

  const openProfile = () => {
    setDetailIdx(null);
    detailOpenRef.current = false;
    setProfileOpen(true);
    profileOpenRef.current = true;
  };

  const closeProfile = () => {
    setProfileOpen(false);
    profileOpenRef.current = false;
  };

  const openDetail = (i: number) => {
    setProfileOpen(false);
    profileOpenRef.current = false;
    setDetailIdx(i);
    detailOpenRef.current = true;
  };

  const closeDetail = () => {
    setDetailIdx(null);
    detailOpenRef.current = false;
  };

  const switchDetail = (dir: number) => {
    setDetailIdx((s) => {
      const n = projects.length;
      return ((s ?? 0) + dir + n) % n;
    });
  };

  const applyCursor = () => {
    const dot = cursorDotRef.current;
    if (!dot) return;
    dot.style.transform = anim.cursorBreak ? "scale(.75)" : anim.cursorHot ? "scale(1.75)" : "scale(1)";
    dot.style.background = anim.cursorHot ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.12)";
    dot.style.borderColor = anim.cursorHot ? "#ffffff" : "rgba(255,255,255,.7)";
  };

  useEffect(() => {
    anim.mx = window.innerWidth / 2;
    anim.my = window.innerHeight / 2;
    anim.cx = anim.mx;
    anim.cy = anim.my;

    const onMove = (e: PointerEvent) => {
      anim.mx = e.clientX;
      anim.my = e.clientY;
      anim.cursorSeen = true;
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const hot = !!(t && t.closest && t.closest('a,button,[role="button"],input,select,textarea'));
      if (hot !== anim.cursorHot) {
        anim.cursorHot = hot;
        applyCursor();
      }
    };
    const onDown = () => {
      anim.cursorBreak = true;
      applyCursor();
      clearTimeout(anim.breakT);
      anim.breakT = setTimeout(() => {
        anim.cursorBreak = false;
        applyCursor();
      }, 210);
    };

    const onKey = (e: KeyboardEvent) => {
      if (loadingRef.current) return;
      if (e.key === "Escape") {
        if (detailOpenRef.current) closeDetail();
        else if (profileOpenRef.current) closeProfile();
        return;
      }
      if (detailOpenRef.current) {
        if (e.key === "ArrowLeft") detailRef.current?.navigate(-1);
        if (e.key === "ArrowRight") detailRef.current?.navigate(1);
        return;
      }
      if (profileOpenRef.current) return;
      if (e.key === "ArrowLeft") carouselRef.current?.step(-1);
      if (e.key === "ArrowRight") carouselRef.current?.step(1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);

    let raf = 0;
    const tick = () => {
      if (cursorRef.current) {
        anim.cx += (anim.mx - anim.cx) * 0.24;
        anim.cy += (anim.my - anim.cy) * 0.24;
        cursorRef.current.style.transform = `translate3d(${anim.cx}px,${anim.cy}px,0)`;
        cursorRef.current.style.opacity = anim.cursorSeen ? "1" : "0";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      clearTimeout(anim.breakT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayUp = profileOpen || detailOpen;
  const n = projects.length;
  const dv = detailIdx == null ? null : projects[detailIdx];
  const prevTitle = projects[((detailIdx ?? 0) - 1 + n) % n].title;
  const nextTitle = projects[((detailIdx ?? 0) + 1) % n].title;

  return (
    <div style={{ minWidth: 0 }}>
      {loading && <Loader onComplete={onLoaderDone} />}

      <div className={`site-frame${detailOpen ? " is-hidden" : ""}`} aria-hidden="true" />

      <header className={`site-chrome${detailOpen ? " is-hidden" : ""}`}>
        <button className="chrome-logo" onClick={closeOverlays} aria-label="Geordie Ellis">
          <LogoIcon width={52} height={38} />
        </button>
        <button
          className={`chrome-profile${profileOpen ? " is-open" : ""}`}
          onClick={() => (profileOpen ? closeProfile() : openProfile())}
          aria-label="Open profile"
          aria-expanded={profileOpen}
        >
          Profile
        </button>
      </header>

      <div className={`deck-inset${profileOpen ? " is-dimmed" : ""}`}>
        <ProjectCarousel ref={carouselRef} projects={projects} paused={overlayUp || loading} onOpen={openDetail} />
      </div>

      <ProfilePanel open={profileOpen} onClose={closeProfile} />
      <ProjectDetail
        ref={detailRef}
        project={dv}
        open={detailOpen}
        onClose={closeDetail}
        onSwitch={switchDetail}
        prevTitle={prevTitle}
        nextTitle={nextTitle}
      />

      <div
        ref={cursorRef}
        className="glass-cursor"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 500,
          width: 26,
          height: 26,
          margin: "-13px 0 0 -13px",
          pointerEvents: "none",
          willChange: "transform",
          opacity: 0,
        }}
      >
        <div
          ref={cursorDotRef}
          className="cursor-dot"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "rgba(255,255,255,.12)",
            border: "1.5px solid rgba(255,255,255,.7)",
            WebkitBackdropFilter: "blur(2px) saturate(140%)",
            backdropFilter: "blur(2px) saturate(140%)",
            boxShadow: "inset 0 1px 3px rgba(255,255,255,.5),0 2px 8px rgba(9,14,40,.45)",
            transition: "transform .28s cubic-bezier(.34,1.56,.64,1),background .3s ease,border-color .3s ease",
          }}
        />
      </div>
    </div>
  );
}
