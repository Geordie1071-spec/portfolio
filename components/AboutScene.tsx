"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  aboutCopy,
  aboutRoleProgress,
  aboutRoles,
  type AboutRoleId,
} from "@/lib/about";

gsap.registerPlugin(ScrollTrigger);

type AboutSceneProps = {
  active: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

function roleFromProgress(p: number): AboutRoleId | null {
  if (p < 0.2) return null;
  if (p < 0.45) return "developer";
  if (p < 0.7) return "ai";
  if (p < 0.9) return "designer";
  return "personal";
}

export default function AboutScene({ active, scrollRef }: AboutSceneProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeRole, setActiveRole] = useState<AboutRoleId | null>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    const stage = stageRef.current;
    if (!scroller || !stage) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);

      gsap.set(q(".about-char-wrap"), { yPercent: 120, scale: 0.8, rotate: -1 });
      gsap.set(q(".about-title-line.line-a"), { x: 0 });
      gsap.set(q(".about-title-line.line-b"), { x: 0, y: 0 });
      gsap.set(q(".about-title"), { opacity: 1 });
      gsap.set(q(".about-copy-panel"), { autoAlpha: 0, y: 18 });
      gsap.set(q(".about-sys-card.api"), { autoAlpha: 0, scale: 0.85, x: 24, y: 18 });
      gsap.set(q(".about-sys-card.db"), { autoAlpha: 0, scale: 0.85, y: 36 });
      gsap.set(q(".about-sys-card.ui"), { autoAlpha: 0, scale: 0.85, y: 28 });
      gsap.set(q(".about-sys-line"), { strokeDashoffset: 1, autoAlpha: 1 });
      gsap.set(q(".about-design-status-concept"), { autoAlpha: 1 });
      gsap.set(q(".about-design-status-built"), { autoAlpha: 0 });
      gsap.set(q(".about-nodes"), { autoAlpha: 0 });
      gsap.set(q(".about-ai-viz"), { autoAlpha: 0, scale: 0.92 });
      gsap.set(q(".about-ai-keywords span"), { autoAlpha: 0, x: -10 });
      gsap.set(q(".about-design-viz"), { autoAlpha: 0 });
      gsap.set(q(".about-wire"), { scale: 0.4, autoAlpha: 0, x: 40, y: 30 });
      gsap.set(q(".about-wire-fill"), { autoAlpha: 0, scaleY: 0.15 });
      gsap.set(q(".about-wire-ui"), { autoAlpha: 0 });
      gsap.set(q(".about-orbit-item"), { autoAlpha: 0, scale: 0.6 });
      gsap.set(q(".about-summary"), { autoAlpha: 0 });
      gsap.set(q(".about-progress-fill"), { scaleX: 0 });
      gsap.set(q(".about-side-progress > span"), { scaleY: 0 });
      gsap.set(q(".about-grid"), { opacity: 0.45 });
      gsap.set(q(".about-scroll-hint"), { autoAlpha: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          scroller,
          trigger: stage,
          start: "top top",
          end: "+=450%",
          pin: true,
          pinType: "transform",
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActiveRole(roleFromProgress(self.progress));
          },
        },
      });

      // 0–20% Introduction — title splits, character rises
      tl.to(q(".about-title-line.line-a"), { x: "-8vw", duration: 2 }, 0);
      tl.to(q(".about-title-line.line-b"), { x: "8vw", y: "6vh", duration: 2 }, 0);
      tl.to(q(".about-char-wrap"), { yPercent: 8, scale: 1, duration: 2 }, 0.2);
      tl.to(q(".about-title"), { opacity: 0.12, duration: 1.2 }, 0.9);
      tl.to(q(".about-grid"), { opacity: 0.7, duration: 1.5 }, 0.4);
      tl.to(q(".about-progress-fill"), { scaleX: 0.2, duration: 2 }, 0);
      tl.to(q(".about-side-progress > span"), { scaleY: 0.2, duration: 2 }, 0);
      tl.to(q(".about-scroll-hint"), { autoAlpha: 0, duration: 0.6 }, 1.2);

      // 20–45% Developer
      tl.to(q(".about-char-wrap"), { xPercent: 18, yPercent: 0, rotate: 1, scale: 1, duration: 2.5 }, 2);
      tl.to(q(".about-title"), { autoAlpha: 0, duration: 0.8 }, 2);
      tl.to(q('.about-copy-panel[data-panel="developer"]'), { autoAlpha: 1, y: 0, duration: 1.2 }, 2.2);
      tl.to(q(".about-sys-card.api"), { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 1 }, 2.4);
      tl.to(q(".about-sys-card.db"), { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 2.7);
      tl.to(q(".about-sys-card.ui"), { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 3);
      tl.to(q(".about-sys-line"), { strokeDashoffset: 0, duration: 1.4 }, 2.5);
      tl.to(q(".about-grid"), { opacity: 0.9, duration: 1.5 }, 2.2);
      tl.to(q(".about-progress-fill"), { scaleX: 0.45, duration: 2.5 }, 2);
      tl.to(q(".about-side-progress > span"), { scaleY: 0.45, duration: 2.5 }, 2);

      // 45–70% AI Student
      tl.to(q('.about-copy-panel[data-panel="developer"]'), { autoAlpha: 0, y: -16, duration: 0.8 }, 4.5);
      tl.to(q(".about-sys-card"), { autoAlpha: 0, scale: 0.5, duration: 1 }, 4.5);
      tl.to(q(".about-sys-line"), { autoAlpha: 0, duration: 0.6 }, 4.5);
      tl.to(q(".about-ai-viz"), { autoAlpha: 1, scale: 1, duration: 1.2 }, 5);
      tl.to(q(".about-nodes"), { autoAlpha: 0.85, duration: 1.4 }, 5);
      tl.to(q(".about-grid"), { opacity: 0.2, duration: 1 }, 5);
      tl.to(q('.about-copy-panel[data-panel="ai"]'), { autoAlpha: 1, y: 0, duration: 1.2 }, 5.2);
      tl.to(q(".about-ai-keywords span"), { autoAlpha: 1, x: 0, stagger: 0.15, duration: 0.8 }, 5.6);
      tl.to(q(".about-char-wrap"), { xPercent: 16, rotate: -0.5, duration: 2.5 }, 4.5);
      tl.to(q(".about-progress-fill"), { scaleX: 0.7, duration: 2.5 }, 4.5);
      tl.to(q(".about-side-progress > span"), { scaleY: 0.7, duration: 2.5 }, 4.5);

      // 70–90% Designer
      tl.to(q('.about-copy-panel[data-panel="ai"]'), { autoAlpha: 0, y: -16, duration: 0.7 }, 7);
      tl.to(q(".about-ai-viz"), { autoAlpha: 0, scale: 0.9, duration: 0.8 }, 7);
      tl.to(q(".about-ai-keywords span"), { autoAlpha: 0, duration: 0.5 }, 7);
      tl.to(q(".about-nodes"), { autoAlpha: 0, duration: 0.8 }, 7);
      tl.to(q(".about-design-viz"), { autoAlpha: 1, duration: 0.8 }, 7.2);
      tl.to(q(".about-wire"), { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 1.2 }, 7.3);
      tl.to(q(".about-wire-fill"), { autoAlpha: 1, scaleY: 1, duration: 1 }, 7.9);
      tl.to(q(".about-wire-ui"), { autoAlpha: 1, duration: 0.8 }, 8.4);
      tl.to(q(".about-design-status-concept"), { autoAlpha: 0, duration: 0.3 }, 8.5);
      tl.to(q(".about-design-status-built"), { autoAlpha: 1, duration: 0.3 }, 8.5);
      tl.to(q('.about-copy-panel[data-panel="designer"]'), { autoAlpha: 1, y: 0, duration: 1 }, 7.4);
      tl.to(q(".about-char-wrap"), { xPercent: 12, scale: 0.98, duration: 2 }, 7);
      tl.to(q(".about-progress-fill"), { scaleX: 0.9, duration: 2 }, 7);
      tl.to(q(".about-side-progress > span"), { scaleY: 0.9, duration: 2 }, 7);

      // 90–100% Personal + summary exit
      tl.to(q('.about-copy-panel[data-panel="designer"]'), { autoAlpha: 0, y: -14, duration: 0.6 }, 9);
      tl.to(q(".about-design-viz"), { autoAlpha: 0, duration: 0.7 }, 9);
      tl.to(q(".about-wire"), { scale: 0.35, autoAlpha: 0, x: 30, y: 40, duration: 0.8 }, 9);
      tl.to(q(".about-char-wrap"), { xPercent: 0, yPercent: 0, scale: 1, rotate: 0, duration: 1 }, 9.1);
      tl.to(q('.about-copy-panel[data-panel="personal"]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 9.2);
      tl.to(
        q(".about-orbit-item"),
        { autoAlpha: 1, scale: 1, stagger: 0.08, duration: 0.7 },
        9.25,
      );
      tl.to(q(".about-progress-fill"), { scaleX: 1, duration: 1 }, 9);
      tl.to(q(".about-side-progress > span"), { scaleY: 1, duration: 1 }, 9);
      tl.to(q(".about-summary"), { autoAlpha: 1, duration: 0.8 }, 9.55);
      tl.to(
        [q(".about-char-wrap"), q(".about-orbit"), q('.about-copy-panel[data-panel="personal"]')],
        { autoAlpha: 0.15, duration: 0.6 },
        9.55,
      );
    }, stage);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [scrollRef]);

  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [active]);

  const jumpToRole = (id: AboutRoleId) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    gsap.to(scroller, {
      scrollTop: max * aboutRoleProgress[id],
      duration: 0.9,
      ease: "power2.inOut",
    });
  };

  return (
    <div ref={scrollRef} className="about-scroll">
      <div ref={stageRef} className="about-stage">
        <div className="about-grid" aria-hidden="true" />
        <div className="about-nodes" aria-hidden="true">
          <svg viewBox="0 0 800 600" fill="none">
            <g stroke="rgba(143,233,242,0.45)" strokeWidth="1">
              <line x1="120" y1="140" x2="260" y2="220" />
              <line x1="260" y1="220" x2="420" y2="160" />
              <line x1="420" y1="160" x2="560" y2="240" />
              <line x1="260" y1="220" x2="300" y2="360" />
              <line x1="420" y1="160" x2="480" y2="340" />
              <line x1="300" y1="360" x2="480" y2="340" />
              <line x1="560" y1="240" x2="680" y2="180" />
              <line x1="480" y1="340" x2="640" y2="400" />
            </g>
            <g fill="#8FE9F2">
              <circle cx="120" cy="140" r="4" />
              <circle cx="260" cy="220" r="5" />
              <circle cx="420" cy="160" r="4" />
              <circle cx="560" cy="240" r="5" />
              <circle cx="300" cy="360" r="4" />
              <circle cx="480" cy="340" r="5" />
              <circle cx="680" cy="180" r="4" />
              <circle cx="640" cy="400" r="4" />
            </g>
          </svg>
        </div>

        <div className="about-chrome">
          <span className="about-label">01 / About</span>
          <span className="about-scroll-hint">Scroll ↓</span>
        </div>

        <div className="about-side-progress" aria-hidden="true">
          <span />
        </div>

        <div className="about-title" aria-hidden="true">
          <div className="about-title-line line-a">More than</div>
          <div className="about-title-line line-b">Just code.</div>
        </div>

        <div className="about-stage-body">
          <div className="about-copy-stack">
            {aboutRoles.map((role) => {
              const panel = aboutCopy[role.id];
              return (
                <div key={role.id} className="about-copy-panel" data-panel={role.id}>
                  <p className="about-kicker">{panel.kicker}</p>
                  {panel.lines.map((line) => (
                    <p key={line} className="about-copy-line">
                      {line}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="about-visual">
            <div className="about-sys" aria-hidden="true">
              <svg className="about-sys-svg" viewBox="0 0 400 400" fill="none">
                <path
                  className="about-sys-line"
                  d="M90 90 L180 170"
                  stroke="rgba(143,233,242,0.65)"
                  strokeWidth="1.5"
                  pathLength="1"
                  strokeDasharray="1"
                />
                <path
                  className="about-sys-line"
                  d="M70 220 L170 230"
                  stroke="rgba(143,233,242,0.65)"
                  strokeWidth="1.5"
                  pathLength="1"
                  strokeDasharray="1"
                />
                <path
                  className="about-sys-line"
                  d="M320 110 L240 180"
                  stroke="rgba(143,233,242,0.65)"
                  strokeWidth="1.5"
                  pathLength="1"
                  strokeDasharray="1"
                />
              </svg>
              <div className="about-sys-card api">
                <span className="tag">Backend</span>
                <span className="name">API Route</span>
              </div>
              <div className="about-sys-card db">
                <span className="tag">Data</span>
                <span className="name">Schema</span>
              </div>
              <div className="about-sys-card ui">
                <span className="tag">Frontend</span>
                <span className="name">Interface</span>
              </div>
            </div>

            <div className="about-ai-viz" aria-hidden="true">
              <svg viewBox="0 0 320 220" fill="none">
                <rect x="18" y="30" width="70" height="44" rx="8" stroke="rgba(220,228,255,0.45)" />
                <rect x="125" y="78" width="70" height="44" rx="8" stroke="#8FE9F2" />
                <rect x="232" y="30" width="70" height="44" rx="8" stroke="rgba(220,228,255,0.45)" />
                <path d="M88 52 H125" stroke="rgba(143,233,242,0.7)" />
                <path d="M195 100 H232" stroke="rgba(143,233,242,0.7)" />
                <path d="M160 122 V168" stroke="rgba(143,233,242,0.7)" />
                <polyline
                  points="40,190 90,170 130,184 180,150 230,162 280,140"
                  stroke="#8FE9F2"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="160" cy="100" r="3" fill="#8FE9F2" />
              </svg>
              <div className="about-ai-keywords">
                <span>Data</span>
                <span>Models</span>
                <span>Automation</span>
              </div>
            </div>

            <div className="about-design-viz" aria-hidden="true">
              <div className="about-wire">
                <div className="about-wire-fill" />
                <div className="about-wire-ui">
                  <div className="bar" />
                  <div className="cards">
                    <div className="card" />
                    <div className="card" />
                  </div>
                  <div className="btn" />
                </div>
              </div>
              <div className="about-design-meta">
                <span>Wireframe → Interface → Product</span>
                <span className="status" style={{ position: "relative", display: "inline-grid" }}>
                  <span className="about-design-status-concept" style={{ gridArea: "1/1" }}>Concept</span>
                  <span className="about-design-status-built" style={{ gridArea: "1/1" }}>Built</span>
                </span>
              </div>
            </div>

            <div className="about-orbit" aria-hidden="true">
              <div className="about-orbit-item" data-item="football">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3l2.4 4.2L19 8.2l-2.2 3.8.4 4.8L12 15.2 6.8 16.8l.4-4.8L5 8.2l4.6-1L12 3z" />
                </svg>
              </div>
              <div className="about-orbit-item" data-item="gym">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M3 10h3v4H3zM18 10h3v4h-3zM6 11h12v2H6zM8 8v8M16 8v8" />
                </svg>
              </div>
              <div className="about-orbit-item" data-item="malta">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
              </div>
              <div className="about-orbit-item" data-item="music">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 13a4 4 0 0 0 4 4h1v-6H7a3 3 0 0 0-3 3zM20 13a4 4 0 0 1-4 4h-1v-6h2a3 3 0 0 1 3 3z" />
                  <path d="M9 11V7a7 7 0 0 1 6-6v4" />
                </svg>
              </div>
            </div>

            <div className="about-char-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- character asset used as scene art */}
              <img
                src="/hero-character.png"
                alt="Illustrated character with a laptop"
                className="about-char"
              />
            </div>
          </div>
        </div>

        <div className="about-summary">
          <h2>{aboutCopy.summary.name}</h2>
          <p>{aboutCopy.summary.roles}</p>
          <p className="place">{aboutCopy.summary.place}</p>
        </div>

        <nav className="about-progress" aria-label="About chapters">
          <div className="about-progress-track" aria-hidden="true">
            <span className="about-progress-fill" />
          </div>
          {aboutRoles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`about-progress-btn${activeRole === role.id ? " is-active" : ""}`}
              onClick={() => jumpToRole(role.id)}
            >
              {role.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
