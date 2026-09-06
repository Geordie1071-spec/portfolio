"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AccentProvider, useAccent } from "@/lib/accent";
import { projects } from "@/lib/projects";
import HomeGallery from "./HomeGallery";
import Loader from "./Loader";
import LogoIcon from "./LogoIcon";
import ProfilePanel from "./ProfilePanel";
import ProjectDetail, { type ProjectDetailHandle } from "./ProjectDetail";

function PortfolioShell() {
  const { accent } = useAccent();
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const detailOpen = detailIdx != null;

  const detailRef = useRef<ProjectDetailHandle>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const orbRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(true);
  const detailOpenRef = useRef(false);
  const profileOpenRef = useRef(false);
  const galleryReadyRef = useRef(false);

  const anim = useRef({
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    ox: 0,
    oy: 0,
    seen: false,
    overThumb: false,
    hot: false,
  }).current;

  const onLoaderDone = useCallback(() => {
    loadingRef.current = false;
    setLoading(false);
  }, []);

  const onGalleryReady = useCallback(() => {
    galleryReadyRef.current = true;
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
    const root = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!root || !dot) return;
    root.classList.toggle("is-hot", anim.hot && !anim.overThumb);
    root.classList.toggle("is-thumb", anim.overThumb);
    root.style.opacity = anim.seen ? "1" : "0";
    dot.style.transform = anim.hot && !anim.overThumb ? "scale(1.65)" : "scale(1)";
  };

  useEffect(() => {
    anim.mx = window.innerWidth / 2;
    anim.my = window.innerHeight / 2;
    anim.cx = anim.mx;
    anim.cy = anim.my;
    anim.ox = anim.mx;
    anim.oy = anim.my;

    const onMove = (e: PointerEvent) => {
      anim.mx = e.clientX;
      anim.my = e.clientY;
      anim.seen = true;
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const overThumb = !!(t && t.closest && t.closest("[data-home-thumb]"));
      const hot = !!(
        t &&
        t.closest &&
        t.closest('a,button,[role="button"],input,select,textarea')
      );
      if (overThumb !== anim.overThumb || hot !== anim.hot) {
        anim.overThumb = overThumb;
        anim.hot = hot;
        orbRef.current?.classList.toggle("is-visible", overThumb);
        applyCursor();
      }
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
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("keydown", onKey);

    let raf = 0;
    const tick = () => {
      // Soft follow — cursor eases, orb lags further behind
      anim.cx += (anim.mx - anim.cx) * 0.11;
      anim.cy += (anim.my - anim.cy) * 0.11;
      anim.ox += (anim.mx - anim.ox) * 0.055;
      anim.oy += (anim.my - anim.oy) * 0.055;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${anim.cx}px,${anim.cy}px,0)`;
        if (anim.seen) cursorRef.current.style.opacity = "1";
      }
      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${anim.ox}px,${anim.oy}px,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = projects.length;
  const dv = detailIdx == null ? null : projects[detailIdx];
  const prevTitle = projects[((detailIdx ?? 0) - 1 + n) % n].title;
  const nextTitle = projects[((detailIdx ?? 0) + 1) % n].title;

  return (
    <div className="portfolio-root" style={{ minWidth: 0, ["--accent" as string]: accent }}>
      {loading && <Loader onComplete={onLoaderDone} sceneReadyRef={galleryReadyRef} />}

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

      <div className={`home-inset${profileOpen ? " is-dimmed" : ""}`}>
        <div className="home-panel">
          <HomeGallery projects={projects} onOpen={openDetail} onReady={onGalleryReady} />
        </div>
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

      <div ref={cursorRef} className="glass-cursor" aria-hidden="true">
        <div ref={cursorDotRef} className="cursor-dot" />
      </div>

      <div ref={orbRef} className="cursor-orb" aria-hidden="true">
        <span className="cursor-orb-face">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function Portfolio() {
  return (
    <AccentProvider>
      <PortfolioShell />
    </AccentProvider>
  );
}
