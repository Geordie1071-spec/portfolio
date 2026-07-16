"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Lenis from "lenis";
import Reveal from "./Reveal";
import AboutScene from "./AboutScene";
import { LOGO_PATHS, FOOTER_SCATTER } from "@/lib/logoPaths";
import { projects } from "@/lib/projects";

type NavKey = "home" | "projects" | "about";

const EMAIL = "geordie1071@gmail.com";
const SCENE_COUNT = 4;
const SCENE_ACTIVE: NavKey[] = ["home", "projects", "about", "about"];

function LogoIcon({ width = 52, height = 38 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 97 70" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} fillRule="evenodd" clipRule="evenodd" d={d} />
      ))}
    </svg>
  );
}

function ChevronIcon({ size = 26 }: { size?: number }) {
  const h = Math.round((size * 101) / 68);
  return (
    <svg width={size} height={h} viewBox="0 0 68 101" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M0.00634539 36.1316L56.2143 3.4052e-07L48.0793 34.0736L25.4509 48.6195L0.00634539 36.1316Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M0.393552 64.8681L56.6015 101L48.4665 66.9261L25.8381 52.3801L0.393552 64.8681Z" />
    </svg>
  );
}

type Anim = {
  tx: number; ty: number; px: number; py: number;
  mx: number; my: number; cx: number; cy: number;
  cursorSeen: boolean; cursorHot: boolean; cursorDown: boolean; cursorBreak: boolean;
  wheelAcc: number; wheelDecay: ReturnType<typeof setTimeout> | undefined;
  sceneLock: boolean; lockT: ReturnType<typeof setTimeout> | undefined; prevScene: number | null;
  aboutAcc: number;
  carDrag: boolean; carStartX: number; carX: number; carAcc: number; carMoved: boolean;
  footT: ReturnType<typeof setTimeout> | undefined;
  detailAnim: boolean;
  breakT: ReturnType<typeof setTimeout> | undefined;
  tsx: number; tsy: number;
};

export default function Portfolio() {
  // ---- render state ----
  const [loading, setLoading] = useState(true);
  const [loadPct, setLoadPct] = useState(0);
  const [loaderRising, setLoaderRising] = useState(false);
  const [scene, setSceneState] = useState(0);
  const [active, setActiveState] = useState<NavKey>("home");
  const [hoverKey, setHoverKeyState] = useState<NavKey | null>(null);
  const [indLeft, setIndLeft] = useState(0);
  const [indWidth, setIndWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasTarget, setHasTarget] = useState(false);
  const [contactOpen, setContactOpenState] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [detailOpen, setDetailOpenState] = useState(false);
  const [cellHover, setCellHover] = useState<number | null>(null);
  const [emailHover, setEmailHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [projIndex, setProjIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [revealed, setRevealedState] = useState<boolean[]>([false, false, false, false]);

  // ---- refs mirroring state read inside persistent closures / the rAF loop ----
  const sceneRef = useRef(0);
  const detailOpenRef = useRef(false);
  const loadingRef = useRef(true);
  const contactOpenRef = useRef(false);
  const isMobileRef = useRef(false);
  const activeRef = useRef<NavKey>("home");
  const hoverKeyRef = useRef<NavKey | null>(null);

  const setScene = (v: number) => { sceneRef.current = v; setSceneState(v); };
  const setDetailOpen = (v: boolean) => { detailOpenRef.current = v; setDetailOpenState(v); };
  const setActive = (v: NavKey) => { activeRef.current = v; setActiveState(v); };
  const setHoverKey = (v: NavKey | null) => { hoverKeyRef.current = v; setHoverKeyState(v); };
  const setContactOpen = (v: boolean | ((p: boolean) => boolean)) => {
    setContactOpenState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      contactOpenRef.current = next;
      return next;
    });
  };

  // ---- DOM refs ----
  const navRef = useRef<HTMLElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const sceneEls = useRef<(HTMLElement | null)[]>([]);
  const charRef = useRef<HTMLImageElement | null>(null);
  const roleLRef = useRef<HTMLSpanElement | null>(null);
  const roleRRef = useRef<HTMLSpanElement | null>(null);
  const carRef = useRef<HTMLDivElement | null>(null);
  const aboutScrollRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const footPathsRef = useRef<SVGPathElement[]>([]);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const detailContentRef = useRef<HTMLDivElement | null>(null);
  const detailGridRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const emailTextRef = useRef<HTMLSpanElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lenisRafRef = useRef<number | undefined>(undefined);

  // ---- mutable animation / gesture state (not React state) ----
  const anim = useRef<Anim>({
    tx: 0, ty: 0, px: 0, py: 0,
    mx: 0, my: 0, cx: 0, cy: 0,
    cursorSeen: false, cursorHot: false, cursorDown: false, cursorBreak: false,
    wheelAcc: 0, wheelDecay: undefined,
    sceneLock: false, lockT: undefined, prevScene: null,
    aboutAcc: 0,
    carDrag: false, carStartX: 0, carX: 0, carAcc: 0, carMoved: false,
    footT: undefined,
    detailAnim: false,
    breakT: undefined,
    tsx: 0, tsy: 0,
  }).current;

  const markRevealed = (i: number) => {
    setRevealedState((prev) => (prev[i] ? prev : prev.map((v, idx) => (idx === i ? true : v))));
  };

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const target = hoverKeyRef.current || activeRef.current;
    const el = target ? (nav.querySelector(`[data-nav="${target}"]`) as HTMLElement | null) : null;
    if (el) {
      setIndLeft(el.offsetLeft);
      setIndWidth(el.offsetWidth);
      setReady(true);
      setHasTarget(true);
    } else {
      setReady(true);
      setHasTarget(false);
    }
  }, []);

  const setFooterAssembled = (on: boolean) => {
    const paths = footPathsRef.current;
    if (!paths.length) return;
    clearTimeout(anim.footT);
    if (on) {
      paths.forEach((p, i) => {
        const s = FOOTER_SCATTER[i % 8];
        p.style.transition = "none";
        p.style.transitionDelay = "0s";
        p.style.transform = `translate(${s[0] * 1.7}px,${s[1] * 1.7}px) rotate(${s[2] * 1.4}deg) scale(.42)`;
        p.style.opacity = "1";
      });
      anim.footT = setTimeout(() => {
        paths.forEach((p, i) => {
          p.style.transition = "transform .5s cubic-bezier(.2,1.4,.4,1)";
          p.style.transitionDelay = `${i * 0.03}s`;
          p.style.transform = "none";
        });
      }, 350);
    } else {
      paths.forEach((p) => {
        p.style.transition = "none";
        p.style.transitionDelay = "0s";
        p.style.transform = "none";
        p.style.opacity = "1";
      });
    }
  };

  const initLenis = () => {
    if (lenisRef.current || !overlayRef.current || !detailContentRef.current) return;
    lenisRef.current = new Lenis({
      wrapper: overlayRef.current,
      content: detailContentRef.current,
      duration: 1.15,
      smoothWheel: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    const raf = (t: number) => {
      lenisRef.current?.raf(t);
      lenisRafRef.current = requestAnimationFrame(raf);
    };
    lenisRafRef.current = requestAnimationFrame(raf);
  };

  const onSceneEnter = (idx: number) => {
    markRevealed(idx);
    if (idx === 2) {
      anim.aboutAcc = 0;
      requestAnimationFrame(() => {
        const el = aboutScrollRef.current;
        if (!el) return;
        const down = anim.prevScene == null || anim.prevScene < 2;
        el.scrollTop = down ? 0 : Math.max(0, el.scrollHeight - el.clientHeight);
      });
    }
    setFooterAssembled(idx === 3);
    measure();
  };

  const goScene = (idx: number) => {
    const max = SCENE_COUNT - 1;
    idx = Math.max(0, Math.min(max, idx));
    if (idx === sceneRef.current || anim.sceneLock) return;
    anim.prevScene = sceneRef.current;
    anim.sceneLock = true;
    setScene(idx);
    setActive(SCENE_ACTIVE[idx]);
    onSceneEnter(idx);
    clearTimeout(anim.lockT);
    anim.lockT = setTimeout(() => { anim.sceneLock = false; }, 1000);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (loadingRef.current || detailOpenRef.current || anim.carDrag) return;
    if (anim.sceneLock) return;
    const sc = sceneRef.current;
    if (sc === 2) {
      const el = aboutScrollRef.current;
      if (!el) return;
      const atTop = el.scrollTop <= 1;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (e.deltaY > 0 && atBottom) {
        anim.aboutAcc += e.deltaY;
        if (anim.aboutAcc > 140) { anim.aboutAcc = 0; goScene(3); }
      } else if (e.deltaY < 0 && atTop) {
        anim.aboutAcc += e.deltaY;
        if (anim.aboutAcc < -140) { anim.aboutAcc = 0; goScene(1); }
      } else {
        anim.aboutAcc = 0;
        el.scrollTop += e.deltaY;
      }
      clearTimeout(anim.wheelDecay);
      anim.wheelDecay = setTimeout(() => { anim.aboutAcc = 0; }, 200);
      return;
    }
    anim.wheelAcc += e.deltaY;
    const TH = 130;
    const N = SCENE_COUNT;
    if (anim.wheelAcc > TH) { goScene((sc + 1) % N); anim.wheelAcc = 0; }
    else if (anim.wheelAcc < -TH) { goScene((sc - 1 + N) % N); anim.wheelAcc = 0; }
    clearTimeout(anim.wheelDecay);
    anim.wheelDecay = setTimeout(() => { anim.wheelAcc = 0; }, 180);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    anim.tsx = t.clientX;
    anim.tsy = t.clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (loadingRef.current || detailOpenRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - anim.tsx, dy = t.clientY - anim.tsy;
    if (Math.abs(dy) <= Math.abs(dx) || Math.abs(dy) <= 50) return;
    const sc = sceneRef.current;
    if (sc === 2) {
      const el = aboutScrollRef.current;
      if (!el) return;
      const atTop = el.scrollTop <= 1;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (dy < 0 && atBottom) goScene(3);
      else if (dy > 0 && atTop) goScene(1);
      return;
    }
    const N = SCENE_COUNT;
    goScene((sc + (dy < 0 ? 1 : -1) + N) % N);
  };

  const openDetail = (i: number) => {
    setDetailIdx(i);
    setDetailOpen(true);
    requestAnimationFrame(() => {
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
      initLenis();
    });
  };
  const closeDetail = () => setDetailOpen(false);

  const switchDetail = (dir: number) => {
    if (anim.detailAnim) return;
    anim.detailAnim = true;
    const g = detailGridRef.current;
    const n = projects.length;
    if (g) {
      g.style.transition = "opacity .24s ease, transform .28s cubic-bezier(.5,0,.15,1)";
      g.style.opacity = "0";
      g.style.transform = "translateY(22px)";
    }
    setTimeout(() => {
      setDetailIdx((s) => ((s ?? 0) + dir + n) % n);
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
      else if (overlayRef.current) overlayRef.current.scrollTop = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (g) { g.style.opacity = "1"; g.style.transform = "translateY(0)"; }
        anim.detailAnim = false;
      }));
    }, 240);
  };

  const scrambleTo = (str: string) => {
    if (emailTextRef.current) emailTextRef.current.textContent = str;
  };
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copyEmail = () => {
    try { navigator.clipboard?.writeText(EMAIL).catch(() => {}); } catch {}
    setCopied(true);
    if (!isMobileRef.current) scrambleTo("Copied!");
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      if (emailHover && !isMobileRef.current) scrambleTo(EMAIL);
    }, 1800);
  };
  const emailEnter = () => {
    setEmailHover(true);
    if (!isMobileRef.current) scrambleTo(copied ? "Copied!" : EMAIL);
  };

  const applyCursorShards = () => {
    const dot = cursorDotRef.current;
    if (!dot) return;
    dot.style.transform = anim.cursorBreak ? "scale(.75)" : anim.cursorHot ? "scale(1.75)" : "scale(1)";
    dot.style.background = anim.cursorHot ? "rgba(143,233,242,.22)" : "rgba(234,247,255,.16)";
    dot.style.borderColor = anim.cursorHot ? "rgba(143,233,242,.95)" : "rgba(234,247,255,.85)";
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/purity -- intro-counter clock read, not render state
    const pctStart = performance.now();
    const pctDur = 3200;
    let pctRaf = 0;
    const pctStep = () => {
      const p = Math.min(1, (performance.now() - pctStart) / pctDur);
      setLoadPct(Math.round(p * 100));
      if (p < 1) pctRaf = requestAnimationFrame(pctStep);
    };
    pctRaf = requestAnimationFrame(pctStep);
    const riseT = setTimeout(() => setLoaderRising(true), 3350);
    const loadT = setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
      requestAnimationFrame(() => onSceneEnter(0));
    }, 4300);

    const onDocDown = (e: MouseEvent) => {
      if (!contactOpenRef.current) return;
      if (rightRef.current && rightRef.current.contains(e.target as Node)) return;
      setContactOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && detailOpenRef.current) { closeDetail(); return; }
      if (detailOpenRef.current || loadingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") goScene(sceneRef.current + 1);
      else if (e.key === "ArrowUp" || e.key === "PageUp") goScene(sceneRef.current - 1);
    };
    document.addEventListener("keydown", onKey);

    const onResize = () => {
      measure();
      const m = window.innerWidth <= 680;
      isMobileRef.current = m;
      setIsMobile(m);
    };
    window.addEventListener("resize", onResize);
    isMobileRef.current = window.innerWidth <= 680;
    setIsMobile(isMobileRef.current);

    anim.mx = window.innerWidth / 2;
    anim.my = window.innerHeight / 2;
    anim.cx = anim.mx; anim.cy = anim.my;

    const onMove = (e: PointerEvent) => {
      anim.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      anim.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      anim.mx = e.clientX; anim.my = e.clientY;
      anim.cursorSeen = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const hot = !!(t && t.closest && t.closest('a,button,[role="button"],input,select,textarea'));
      if (hot !== anim.cursorHot) { anim.cursorHot = hot; applyCursorShards(); }
    };
    document.addEventListener("pointerover", onOver, { passive: true });

    const onDown = () => {
      anim.cursorDown = true; anim.cursorBreak = true; applyCursorShards();
      clearTimeout(anim.breakT);
      anim.breakT = setTimeout(() => { anim.cursorBreak = false; applyCursorShards(); }, 210);
    };
    const onUp = () => { anim.cursorDown = false; };
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    const boot = () => measure();
    requestAnimationFrame(boot);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
    const bootT = setTimeout(boot, 400);

    let raf = 0;
    const tick = () => {
      if (cursorRef.current) {
        anim.cx += (anim.mx - anim.cx) * 0.24;
        anim.cy += (anim.my - anim.cy) * 0.24;
        cursorRef.current.style.transform = `translate3d(${anim.cx}px,${anim.cy}px,0)`;
        cursorRef.current.style.opacity = anim.cursorSeen ? "1" : "0";
      }
      anim.px += (anim.tx - anim.px) * 0.08;
      anim.py += (anim.ty - anim.py) * 0.08;
      if (isMobileRef.current) {
        if (charRef.current) charRef.current.style.transform = "translateX(-50%)";
        if (roleLRef.current) roleLRef.current.style.transform = "translateY(-50%)";
        if (roleRRef.current) roleRRef.current.style.transform = "translateY(-50%)";
      } else {
        if (charRef.current) charRef.current.style.transform = `translateX(calc(-50% + ${anim.px * -22}px))`;
        if (roleLRef.current) roleLRef.current.style.transform = `translateY(-50%) translateX(${anim.px * 14}px)`;
        if (roleRRef.current) roleRRef.current.style.transform = `translateY(-50%) translateX(${anim.px * -14}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pctRaf);
      clearTimeout(riseT);
      clearTimeout(loadT);
      clearTimeout(bootT);
      clearTimeout(copyTimerRef.current);
      clearTimeout(anim.footT);
      clearTimeout(anim.lockT);
      clearTimeout(anim.breakT);
      if (lenisRafRef.current) cancelAnimationFrame(lenisRafRef.current);
      lenisRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = loading || detailOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loading, detailOpen]);

  // ---- nav derived values ----
  const navTarget = hoverKey || active;
  const colHome = navTarget === "home" ? "#15193a" : "#DCE4FF";
  const colProjects = navTarget === "projects" ? "#15193a" : "#C3CEF2";
  const colAbout = navTarget === "about" ? "#15193a" : "#C3CEF2";
  const indOpacity = ready && hasTarget ? 1 : 0;

  const enterHome = () => { setHoverKey("home"); measure(); };
  const enterProjects = () => { setHoverKey("projects"); measure(); };
  const enterAbout = () => { setHoverKey("about"); measure(); };
  const onNavLeave = () => { setHoverKey(null); measure(); };
  const onWork = () => { setContactOpen(false); goScene(0); };
  const onProjectsNav = () => { setContactOpen(false); goScene(1); };
  const onAboutNav = () => { setContactOpen(false); goScene(2); };
  const toggleContact = () => setContactOpen((v) => !v);
  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
  const mobileGoProjects = () => { setMobileMenuOpen(false); goScene(1); };
  const mobileGoAbout = () => { setMobileMenuOpen(false); goScene(2); };

  // ---- carousel drag ----
  const n = projects.length;
  const carDown = (e: React.PointerEvent) => {
    anim.carDrag = true; anim.carStartX = e.clientX; anim.carX = e.clientX; anim.carAcc = 0; anim.carMoved = false;
    if (carRef.current) carRef.current.style.cursor = "grabbing";
  };
  const carMove = (e: React.PointerEvent) => {
    if (!anim.carDrag) return;
    const dx = e.clientX - anim.carX; anim.carX = e.clientX;
    if (Math.abs(e.clientX - anim.carStartX) > 8) anim.carMoved = true;
    anim.carAcc += dx;
    const th = 84;
    if (anim.carAcc <= -th) { setProjIndex((p) => Math.min(n - 1, p + 1)); anim.carAcc = 0; }
    else if (anim.carAcc >= th) { setProjIndex((p) => Math.max(0, p - 1)); anim.carAcc = 0; }
  };
  const carUp = () => { anim.carDrag = false; if (carRef.current) carRef.current.style.cursor = "grab"; };

  // ---- footer email pill derived values ----
  const eH = emailHover || copied;
  const emailExpand = eH && !isMobile;
  const emailTextColor = copied ? "#8FE9F2" : "#E4E9FF";
  const emailMax = emailExpand ? "260px" : "0px";
  const emailTextOpacity = emailExpand ? 1 : 0;
  const emailPadLeft = emailExpand ? "12px" : "0px";
  const emailPadRight = emailExpand ? "18px" : "0px";
  const emailPillBg = eH ? "rgba(43,71,255,.16)" : "rgba(255,255,255,.05)";
  const emailPillShadow = eH ? "0 12px 30px rgba(43,71,255,.28)" : "0 8px 20px rgba(0,0,0,.2)";
  const emailIconBg = copied ? "#34D399" : eH ? "#2b47ff" : "rgba(255,255,255,.08)";
  const emailIconColor = copied || eH ? "#fff" : "#C9D2F2";
  const emailMailO = copied ? 0 : 1;
  const emailCheckO = copied ? 1 : 0;
  const emailCheckT = copied ? "scale(1)" : "scale(.5)";

  const dv = detailIdx == null ? null : projects[detailIdx];

  const sceneStyle = (i: number): CSSProperties => ({
    position: "absolute", inset: 0,
    transform: `translateY(${(i - scene) * 100}%)`,
    transition: "transform .9s cubic-bezier(.76,0,.24,1)",
    willChange: "transform",
  });

  const projNavOn = scene === 1 && !detailOpen && !loading;
  const frameInset = isMobile ? 5 : 14;
  const rightArrowInset = isMobile ? 3 : 10;
  const edgeArrowStyle = (side: "left" | "right"): CSSProperties => ({
    top: "50%",
    ...(side === "left" ? { left: frameInset } : { right: rightArrowInset }),
    transform: `translateY(-50%) translateX(${projNavOn ? "0" : side === "left" ? "-120%" : "120%"})`,
    opacity: projNavOn ? 1 : 0,
    pointerEvents: projNavOn ? "auto" : "none",
    transition: "opacity .4s ease,transform .55s cubic-bezier(.5,0,.15,1)",
  });

  return (
    <div style={{ minWidth: 0 }}>
      {loading && <Loader pct={loadPct} rising={loaderRising} />}

      <div className="site-frame" aria-hidden="true" />

      {/* header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "transparent" }}>
        <div className="header-row" style={{ margin: "0 auto", padding: "26px 46px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          {isMobile ? (
            <>
              <button
                onClick={onWork}
                aria-label="Go to home section"
                className="nav-logo"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#DCE4FF", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <LogoIcon width={52} height={38} />
              </button>
              <button onClick={toggleMobileMenu} aria-label="Open menu" className="contact-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
            </>
          ) : (
            <>
              <nav ref={navRef as React.RefObject<HTMLElement>} onMouseLeave={onNavLeave} style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: 10 }}>
                <div
                  style={{
                    position: "absolute", top: 10, bottom: 10, left: indLeft, width: indWidth, opacity: indOpacity,
                    background: "#E6E8F0", borderRadius: 999, boxShadow: "0 6px 18px rgba(0,0,0,.22)",
                    transition: "left .34s cubic-bezier(.5,0,.15,1),width .34s cubic-bezier(.5,0,.15,1),opacity .25s ease",
                    pointerEvents: "none",
                  }}
                />
                <span
                  data-nav="home" onMouseEnter={enterHome} onClick={onWork} aria-label="Home" className="nav-logo"
                  style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colHome, padding: "12px 22px", borderRadius: 999, cursor: "pointer", userSelect: "none", transition: "color .3s ease" }}
                >
                  <LogoIcon width={52} height={38} />
                </span>
                <button
                  data-nav="projects" onMouseEnter={enterProjects} onClick={onProjectsNav} className="nav-txt"
                  style={{ position: "relative", zIndex: 1, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18, letterSpacing: ".09em", textTransform: "uppercase", color: colProjects, padding: "16px 30px", borderRadius: 999, transition: "color .3s ease" }}
                >
                  Projects
                </button>
                <button
                  data-nav="about" onMouseEnter={enterAbout} onClick={onAboutNav} className="nav-txt"
                  style={{ position: "relative", zIndex: 1, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18, letterSpacing: ".09em", textTransform: "uppercase", color: colAbout, padding: "16px 30px", borderRadius: 999, transition: "color .3s ease" }}
                >
                  About
                </button>
              </nav>

              <div ref={rightRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginRight: "clamp(8px,2vw,28px)" }}>
                <a href="#" className="btn-resume resume-btn">Resume</a>
                <button onClick={toggleContact} aria-label="Contact options" className={`contact-btn${contactOpen ? " is-open" : ""}`}>
                  <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </button>
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 16px)", right: 0, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end",
                    opacity: contactOpen ? 1 : 0,
                    transform: contactOpen ? "translateY(0) scale(1)" : "translateY(-10px) scale(.88)",
                    pointerEvents: contactOpen ? "auto" : "none",
                    transformOrigin: "top right",
                    transition: "opacity .26s ease,transform .32s cubic-bezier(.34,1.56,.64,1)",
                  }}
                >
                  <a href="#" aria-label="LinkedIn" className="social-bubble">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.36c0-1.28-.02-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V21H9z" /></svg>
                  </a>
                  <a href="#" aria-label="GitHub" className="social-bubble">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
                  </a>
                  <a href={`mailto:${EMAIL}`} aria-label="Email" className="social-bubble">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 6l9 6.5L21 6" /></svg>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* mobile menu overlay — framed to match the deck's white border */}
      {isMobile && (
        <div
          aria-hidden={!mobileMenuOpen}
          style={{
            position: "fixed", inset: 5, zIndex: 500, borderRadius: 16, overflow: "hidden", background: "#0B1E6B",
            display: "flex", flexDirection: "column", alignItems: "center",
            opacity: mobileMenuOpen ? 1 : 0,
            transform: mobileMenuOpen ? "scale(1)" : "scale(.96)",
            pointerEvents: mobileMenuOpen ? "auto" : "none",
            transition: "opacity .38s ease, transform .38s cubic-bezier(.5,0,.15,1)",
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"
            style={{ position: "absolute", top: 28, right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.08)", color: "#EAECFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <span style={{ marginTop: "clamp(60px,10vh,90px)", color: "#DCE4FF" }}>
            <LogoIcon width={52} height={38} />
          </span>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(28px,6vh,48px)" }}>
            <button
              onClick={mobileGoProjects}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#EAECFF", fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, fontSize: "clamp(26px,7vw,36px)", letterSpacing: ".01em", textTransform: "uppercase" }}
            >
              Projects
            </button>
            <button
              onClick={mobileGoAbout}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#EAECFF", fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, fontSize: "clamp(26px,7vw,36px)", letterSpacing: ".01em", textTransform: "uppercase" }}
            >
              About
            </button>
            <a
              href="#" onClick={() => setMobileMenuOpen(false)}
              style={{ color: "#EAECFF", fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, fontSize: "clamp(26px,7vw,36px)", letterSpacing: ".01em", textTransform: "uppercase" }}
            >
              Resume
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "clamp(50px,9vh,80px)" }}>
            <a href="#" aria-label="LinkedIn" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.36c0-1.28-.02-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V21H9z" /></svg>
            </a>
            <a href="#" aria-label="GitHub" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="Email" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 6l9 6.5L21 6" /></svg>
            </a>
          </div>
        </div>
      )}

      {/* projects edge arrows */}
      <button className="edge-tab left" onClick={() => setProjIndex((p) => (p - 1 + n) % n)} aria-label="Previous project" style={edgeArrowStyle("left")}>
        <ChevronIcon size={26} />
      </button>
      <button className="edge-tab right" onClick={() => setProjIndex((p) => (p + 1) % n)} aria-label="Next project" style={edgeArrowStyle("right")}>
        <ChevronIcon size={26} />
      </button>

      {/* scene progress dots — inset so they clear the projects right arrow */}
      <div
        className="scene-dots"
        style={{
          position: "fixed",
          right: scene === 1 ? 96 : 30,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          transition: "right .35s ease",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i} onClick={() => goScene(i)} aria-label="Go to section"
            style={{ width: 10, border: "none", cursor: "pointer", padding: 0, borderRadius: 999, transition: "height .4s cubic-bezier(.34,1.56,.64,1),background .3s ease", height: i === scene ? 28 : 10, background: i === scene ? "#8FE9F2" : "rgba(200,215,255,.35)" }}
          />
        ))}
      </div>

      {/* deck */}
      <div ref={deckRef} className="deck-inset" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ position: "fixed", inset: isMobile ? 5 : 14, borderRadius: isMobile ? 16 : 30, overflow: "hidden", zIndex: 2 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background:
              "radial-gradient(55% 48% at 22% 28%,rgba(43,71,255,.55),transparent 72%),radial-gradient(48% 44% at 84% 22%,rgba(143,233,242,.26),transparent 72%),radial-gradient(70% 62% at 72% 88%,rgba(96,64,214,.5),transparent 72%),radial-gradient(60% 55% at 26% 84%,rgba(14,24,96,.6),transparent 72%),linear-gradient(160deg,#0C1E63,#0A1650)",
            filter: "saturate(118%)",
          }}
        />

        {/* SCENE 0 — HERO */}
        <section
          ref={(el) => { sceneEls.current[0] = el; }}
          data-scene="0"
          style={sceneStyle(0)}
        >
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- position/transform driven imperatively every frame */}
            <img
              ref={charRef} src="/hero-character.png" alt="Geordie Ellis" className="hero-char"
              style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", height: "min(84vh,900px)", width: "auto", objectFit: "contain", pointerEvents: "none", filter: "drop-shadow(0 26px 55px rgba(4,7,26,.5))", willChange: "transform", zIndex: 2 }}
            />
            <span ref={roleLRef} className="role-link hero-role hero-role-l" style={{ position: "absolute", left: "clamp(20px,4vw,80px)", top: "46%", transform: "translateY(-50%)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(18px,2vw,36px)", letterSpacing: ".01em", textTransform: "uppercase", color: "#EAECFF", lineHeight: 1.02, zIndex: 3 }}>
              Software<br />Developer
            </span>
            <span ref={roleRRef} className="role-link hero-role hero-role-r" style={{ position: "absolute", right: "clamp(20px,4vw,80px)", top: "46%", transform: "translateY(-50%)", textAlign: "right", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(18px,2vw,36px)", letterSpacing: ".01em", textTransform: "uppercase", color: "#EAECFF", lineHeight: 1.02, zIndex: 3 }}>
              Web<br />Designer
            </span>
            <Reveal
              as="h1" revealed={revealed[0]} className="hero-name"
              style={{ position: "absolute", left: 0, right: 0, bottom: "clamp(8px,2vh,30px)", margin: 0, textAlign: "center", whiteSpace: "nowrap", fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, fontSize: "clamp(40px,13.3vw,240px)", lineHeight: 0.78, letterSpacing: "-.02em", textTransform: "uppercase", color: "#F3F4FF", opacity: 0.94, zIndex: 4, textShadow: "0 18px 50px rgba(4,7,26,.5)" }}
            >
              Geordie<br className="hero-name-br" /> Ellis
            </Reveal>
            <div style={{ position: "absolute", left: 34, bottom: 26, zIndex: 5, display: "flex", alignItems: "center", gap: 9, color: "#BFD0FF" }}>
              <span style={{ display: "block", animation: "bob 1.5s ease-in-out infinite" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>Scroll</span>
            </div>
          </div>
        </section>

        {/* SCENE 1 — PROJECTS */}
        <section ref={(el) => { sceneEls.current[1] = el; }} data-scene="1" style={sceneStyle(1)}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(20px,3vh,40px)", padding: "0 clamp(40px,7vw,110px)" }}>
            <div
              ref={carRef} onPointerDown={carDown} onPointerMove={carMove} onPointerUp={carUp} onPointerLeave={carUp}
              style={{ position: "relative", perspective: 1900, width: "100%", height: "clamp(400px,56vh,600px)", cursor: "grab", touchAction: "pan-y", userSelect: "none" }}
            >
              {projects.map((p, i) => {
                const hov = cellHover === i;
                let off = i - projIndex;
                if (off > n / 2) off -= n; else if (off < -n / 2) off += n;
                const a = Math.abs(off);
                const shift = off * 62;
                const rot = off === 0 ? 0 : off < 0 ? 34 : -34;
                const cscale = off === 0 ? 1 : 0.82;
                const depth = a === 0 ? 0 : -220 - (a - 1) * 120;
                const opacity = a === 0 ? 1 : a === 1 ? 0.42 : 0;
                const vwColor = off === 0 && hov ? "#12193B" : "#fff";
                const vwBg = off === 0 && hov ? "#fff" : "transparent";
                return (
                  <button
                    key={p.title}
                    onClick={() => { if (anim.carMoved) return; if (off === 0) openDetail(i); else setProjIndex(i); }}
                    onMouseEnter={() => setCellHover(i)}
                    onMouseLeave={() => setCellHover(null)}
                    style={{
                      position: "absolute", top: "50%", left: "50%", width: "clamp(360px,52vw,720px)",
                      background: off === 0 ? (hov ? "rgba(43,71,255,.16)" : "rgba(12,18,50,.72)") : "rgba(9,14,40,.6)",
                      border: `1px solid ${off === 0 ? "rgba(150,190,235,.3)" : "rgba(150,190,235,.14)"}`,
                      borderRadius: 30, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", textAlign: "center",
                      padding: "clamp(40px,4vw,66px) clamp(30px,4vw,66px)", minHeight: "clamp(400px,54vh,610px)",
                      WebkitBackdropFilter: "blur(18px) saturate(125%)", backdropFilter: "blur(18px) saturate(125%)",
                      boxShadow: `0 40px 110px rgba(0,0,0,${off === 0 ? ".5" : ".32"})`,
                      transform: `translate(-50%,-50%) translateX(${shift}%) translateZ(${depth}px) rotateY(${rot}deg) scale(${cscale})`,
                      opacity, zIndex: 100 - a, pointerEvents: a <= 1 ? "auto" : "none",
                      transition: "transform .6s cubic-bezier(.5,0,.15,1),opacity .5s ease,background .35s ease,border-color .35s ease,box-shadow .5s ease",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(10px,.9vw,12px)", letterSpacing: ".14em", textTransform: "uppercase", color: "#12193B", background: "#8FE9F2", borderRadius: 999, padding: "6px 13px" }}>{p.category}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "clamp(12px,1vw,15px)", letterSpacing: ".06em", color: "#9AA6CC" }}>{p.year}</span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: off === 0 && hov ? "scale(1.05)" : "scale(1)", transition: "transform .4s cubic-bezier(.34,1.56,.64,1)" }}>
                      <span style={{ fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, textTransform: "uppercase", letterSpacing: 0, fontSize: "clamp(48px,5.8vw,96px)", lineHeight: 0.92, color: "#fff" }}>{p.title}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "clamp(15px,1.4vw,22px)", lineHeight: 1.5, color: "#C3CBDD", maxWidth: "32ch" }}>{p.tagline}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "stretch", border: `2.5px solid ${vwColor}`, borderRadius: 11, overflow: "hidden", transition: "background .3s ease,color .3s ease", background: vwBg }}>
                      <span style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(13px,1.1vw,16px)", letterSpacing: ".08em", textTransform: "uppercase", color: vwColor, padding: "12px clamp(16px,1.4vw,22px)" }}>View Work</span>
                      <span style={{ width: 2.5, background: vwColor, flex: "none" }} />
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: vwColor, padding: "0 clamp(12px,1vw,16px)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform .35s ease", transform: off === 0 && hov ? "translateX(5px)" : "translateX(0)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {projects.map((p, i) => (
                <button
                  key={p.title} onClick={() => setProjIndex(i)} aria-label="Go to project"
                  style={{ height: 9, borderRadius: 999, border: "none", cursor: "pointer", padding: 0, transition: "width .4s cubic-bezier(.34,1.56,.64,1),background .3s ease", width: i === projIndex ? 30 : 9, background: i === projIndex ? "#8FE9F2" : "rgba(150,190,235,.3)" }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SCENE 2 — ABOUT */}
        <section ref={(el) => { sceneEls.current[2] = el; }} data-scene="2" style={sceneStyle(2)}>
          <AboutScene revealed={revealed[2]} scrollRef={aboutScrollRef} />
        </section>

        {/* SCENE 3 — FOOTER / CONTACT */}
        <section ref={(el) => { sceneEls.current[3] = el; }} data-scene="3" style={sceneStyle(3)}>
          <div ref={footerRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(30px,3.4vw,50px)", padding: "0 46px" }}>
            <span style={{ display: "flex", alignItems: "center", color: "#E4E9FF" }}>
              <svg style={{ width: "min(52vw,340px)", height: "auto", overflow: "visible" }} viewBox="0 0 97 70" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                {LOGO_PATHS.map((d, i) => (
                  <path key={i} ref={(el) => { if (el) footPathsRef.current[i] = el; }} style={{ transformBox: "fill-box", transformOrigin: "center" }} fillRule="evenodd" clipRule="evenodd" d={d} />
                ))}
              </svg>
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={copyEmail} onMouseEnter={emailEnter} onMouseLeave={() => setEmailHover(false)} aria-label="Copy email address"
                style={{ display: "flex", alignItems: "center", gap: 0, height: 54, padding: "0 6px", border: "1px solid rgba(150,190,235,.28)", borderRadius: 999, background: emailPillBg, color: "#E4E9FF", cursor: "pointer", overflow: "hidden", transition: "background .3s ease,border-color .3s ease,box-shadow .3s ease", boxShadow: emailPillShadow }}
              >
                <span style={{ flex: "none", display: "inline-grid", placeItems: "center", width: 42, height: 42, borderRadius: "50%", background: emailIconBg, color: emailIconColor, transition: "background .3s ease,color .3s ease" }}>
                  <svg style={{ gridArea: "1/1", opacity: emailMailO, transition: "opacity .25s ease" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 6l9 6.5L21 6" /></svg>
                  <svg style={{ gridArea: "1/1", opacity: emailCheckO, transform: emailCheckT, transition: "opacity .25s ease,transform .4s cubic-bezier(.34,1.56,.64,1)" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span className="email-text" style={{ display: "inline-flex", alignItems: "center", maxWidth: emailMax, opacity: emailTextOpacity, overflow: "hidden", whiteSpace: "nowrap", transition: "max-width .42s cubic-bezier(.5,0,.15,1),opacity .3s ease,padding .42s ease", paddingLeft: emailPadLeft, paddingRight: emailPadRight }}>
                  <span ref={emailTextRef} style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, letterSpacing: ".02em", fontVariantNumeric: "tabular-nums", color: emailTextColor, transition: "color .3s ease" }}>{EMAIL}</span>
                </span>
              </button>

              <a href="#" aria-label="LinkedIn" className="social-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.36c0-1.28-.02-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V21H9z" /></svg>
              </a>
              <a href="#" aria-label="GitHub" className="social-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
              </a>
              <a href="#" aria-label="X" className="social-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#8891b5" }}>© 2026 Geordie Ellis</span>
          </div>
        </section>
      </div>

      {/* project detail overlay */}
      <div
        ref={overlayRef} data-detail
        style={{
          position: "fixed", inset: 0, zIndex: 100, overflowY: "auto", overflowX: "hidden",
          background: "rgba(6,10,28,.82)", WebkitBackdropFilter: "blur(24px) saturate(120%)", backdropFilter: "blur(24px) saturate(120%)",
          opacity: detailOpen ? 1 : 0, pointerEvents: detailOpen ? "auto" : "none", transition: "opacity .4s ease",
        }}
      >
        <button className="edge-tab left" onClick={() => switchDetail(-1)} aria-label="Previous project" style={{ top: "50%", transform: "translateY(-50%)" }}>
          <ChevronIcon size={36} />
        </button>
        <button className="edge-tab right" onClick={() => switchDetail(1)} aria-label="Next project" style={{ top: "50%", transform: "translateY(-50%)" }}>
          <ChevronIcon size={36} />
        </button>
        {dv && (
          <div ref={detailContentRef} className="detail-wrap" style={{ minHeight: "100vh", padding: "clamp(24px,4vw,56px) 0 clamp(70px,8vw,120px) clamp(96px,11vw,150px)" }}>
            <div style={{ maxWidth: "none", margin: 0 }}>
              <button onClick={closeDetail} className="pill-btn-outline detail-close" style={{ marginBottom: "clamp(24px,3vw,40px)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                All projects
              </button>
              <div className="detail-grid" ref={detailGridRef}>
                <div className="detail-left">
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#12193B" }}>
                    <span style={{ background: "#8FE9F2", borderRadius: 999, padding: "6px 13px" }}>{dv.category}</span>
                    <span style={{ color: "#9FB0E8" }}>{dv.year} · {dv.role}</span>
                  </div>
                  <h1 style={{ fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, textTransform: "uppercase", letterSpacing: 0, fontSize: "clamp(52px,6.6vw,110px)", lineHeight: 0.9, margin: 0, paddingRight: "0.08em", background: "linear-gradient(100deg,#7FE7F0,#A6AAFF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                    {dv.title}
                  </h1>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "clamp(17px,1.5vw,22px)", lineHeight: 1.5, color: "#DCE4FF", margin: 0, maxWidth: "42ch" }}>{dv.tagline}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9FB0E8" }}>Overview</div>
                    {dv.overview.map((para) => (
                      <p key={para} style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.75, color: "#C9D2F2", margin: 0 }}>{para}</p>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9FB0E8" }}>Stack</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                      {dv.tools.map((tool) => (
                        <span key={tool} style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "#DCE4FF", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 999, padding: "8px 15px" }}>{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="detail-imgs">
                  {dv.pages.map((pg) => (
                    <div key={pg.id} style={{ position: "relative", overflow: "hidden", background: "rgba(10,16,44,.4)" }}>
                      {pg.img ? (
                        // eslint-disable-next-line @next/next/no-img-element -- full-bleed stacked image, sized imperatively via CSS clamp
                        <img src={pg.img} alt={pg.cap} style={{ width: "100%", height: "clamp(420px,86vh,1040px)", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "clamp(420px,86vh,1040px)", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(43,71,255,.18),rgba(143,233,242,.08))", color: "#9FB0E8", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, letterSpacing: ".04em", textAlign: "center", padding: "0 24px" }}>
                          {pg.ph}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* cursor */}
      <div ref={cursorRef} className="glass-cursor" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, zIndex: 400, width: 26, height: 26, margin: "-13px 0 0 -13px", pointerEvents: "none", willChange: "transform", opacity: 0 }}>
        <div
          ref={cursorDotRef} className="cursor-dot"
          style={{
            width: "100%", height: "100%", borderRadius: "50%", background: "rgba(234,247,255,.16)", border: "1.5px solid rgba(234,247,255,.85)",
            WebkitBackdropFilter: "blur(2px) saturate(140%)", backdropFilter: "blur(2px) saturate(140%)",
            boxShadow: "inset 0 1px 3px rgba(255,255,255,.5),0 2px 8px rgba(9,14,40,.45)",
            transition: "transform .28s cubic-bezier(.34,1.56,.64,1),background .3s ease,border-color .3s ease",
          }}
        />
      </div>
    </div>
  );
}

function Loader({ pct, rising }: { pct: number; rising: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 300, background: "#0B1E6B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "clamp(34px,6vh,64px)", transform: `translateY(${rising ? "-100%" : "0%"})`, transition: "transform .95s cubic-bezier(.76,0,.24,1)", willChange: "transform",
      }}
    >
      <svg style={{ width: "min(40vw,260px)", height: "auto", display: "block", overflow: "visible" }} viewBox="0 0 97 70" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
        {LOGO_PATHS.map((d, i) => {
          const delay = [0.1, 0.3, 0.55, 0.75, 0.2, 0.65, 0.9, 0.42][i];
          return (
            <path
              key={i}
              style={{ transformBox: "fill-box", transformOrigin: "center", animation: `shardPulse 1.7s cubic-bezier(.34,1.6,.5,1) ${delay}s infinite,shardHue 3.1s ease ${delay}s forwards` }}
              fillRule="evenodd" clipRule="evenodd" d={d}
            />
          );
        })}
      </svg>
      <div style={{ fontFamily: "'Tusker Grotesk', var(--font-heading), sans-serif", fontWeight: 400, fontSize: "clamp(26px,4vw,54px)", lineHeight: 0.9, color: "#EAECFF", letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums", marginTop: "clamp(10px,2vh,26px)" }}>
        {pct}%
      </div>
    </div>
  );
}
