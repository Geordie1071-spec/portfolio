"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  aboutIntro,
  capabilities,
  experience,
  personal,
  stackGroups,
} from "@/lib/about";

gsap.registerPlugin(ScrollTrigger);

const PANEL_COUNT = 5;

type AboutSceneProps = {
  active: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ active, scrollRef }: AboutSceneProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const scroller = scrollRef.current;
    const stage = stageRef.current;
    if (!scroller || !stage) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);
      const panels = gsap.utils.toArray<HTMLElement>(q(".about-panel"));

      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(panels[0], { autoAlpha: 1 });

      // Intro pieces start hidden for entrance
      gsap.set(q("[data-intro]"), { autoAlpha: 0, y: 28 });
      gsap.set(q("[data-cap-card]"), { autoAlpha: 0, y: 40, scale: 0.92 });
      gsap.set(q("[data-cap-head]"), { autoAlpha: 0, y: 20 });
      gsap.set(q("[data-stack-head]"), { autoAlpha: 0, y: 20 });
      gsap.set(q("[data-stack-group]"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-tool-chip]"), { autoAlpha: 0, y: 16, scale: 0.96 });
      gsap.set(q("[data-path-head]"), { autoAlpha: 0, y: 20 });
      gsap.set(q("[data-path-item]"), { autoAlpha: 0, x: -18 });
      gsap.set(q("[data-personal-pane]"), { autoAlpha: 0, y: 28 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          scroller,
          trigger: stage,
          start: "top top",
          end: `+=${PANEL_COUNT * 100}%`,
          pin: true,
          pinType: "transform",
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / PANEL_COUNT,
            duration: 0.32,
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const idx = Math.min(
              PANEL_COUNT - 1,
              Math.floor(self.progress * PANEL_COUNT),
            );
            setStep(idx);
          },
        },
      });

      // Each panel owns 1.0 timeline unit (scroll maps evenly across 5 screens)

      // —— 0 Intro ——
      tl.to(q("[data-intro='label']"), { autoAlpha: 1, y: 0, duration: 0.35 }, 0);
      tl.to(q("[data-intro='title']"), { autoAlpha: 1, y: 0, duration: 0.4 }, 0.12);
      tl.to(q("[data-intro='p']"), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0.28);

      // —— 1 Capabilities ——
      tl.to(panels[0], { autoAlpha: 0, y: -28, duration: 0.28 }, 1);
      tl.set(panels[1], { autoAlpha: 1, y: 32 }, 1);
      tl.to(panels[1], { y: 0, duration: 0.28 }, 1);
      tl.to(q("[data-cap-head]"), { autoAlpha: 1, y: 0, duration: 0.3 }, 1.1);
      tl.to(
        q("[data-cap-card]"),
        { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.4 },
        1.22,
      );

      // —— 2 Stack ——
      tl.to(panels[1], { autoAlpha: 0, y: -28, duration: 0.28 }, 2);
      tl.set(panels[2], { autoAlpha: 1, y: 32 }, 2);
      tl.to(panels[2], { y: 0, duration: 0.28 }, 2);
      tl.to(q("[data-stack-head]"), { autoAlpha: 1, y: 0, duration: 0.3 }, 2.1);
      tl.to(q("[data-stack-group]"), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.32 }, 2.18);
      tl.to(
        q("[data-tool-chip]"),
        { autoAlpha: 1, y: 0, scale: 1, stagger: 0.025, duration: 0.3 },
        2.28,
      );

      // —— 3 Path ——
      tl.to(panels[2], { autoAlpha: 0, y: -28, duration: 0.28 }, 3);
      tl.set(panels[3], { autoAlpha: 1, y: 32 }, 3);
      tl.to(panels[3], { y: 0, duration: 0.28 }, 3);
      tl.to(q("[data-path-head]"), { autoAlpha: 1, y: 0, duration: 0.3 }, 3.1);
      tl.to(
        q("[data-path-item]"),
        { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.35 },
        3.22,
      );

      // —— 4 Personal / Currently ——
      tl.to(panels[3], { autoAlpha: 0, y: -28, duration: 0.28 }, 4);
      tl.set(panels[4], { autoAlpha: 1, y: 32 }, 4);
      tl.to(panels[4], { y: 0, duration: 0.28 }, 4);
      tl.to(
        q("[data-personal-pane]"),
        { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4 },
        4.15,
      );
      tl.to({}, { duration: 0.85 }, 4.15);
    }, stage);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [scrollRef]);

  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [active]);

  const jumpTo = (index: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    gsap.to(scroller, {
      scrollTop: max * ((index + 0.08) / PANEL_COUNT),
      duration: 0.7,
      ease: "power2.inOut",
    });
  };

  return (
    <div ref={scrollRef} className="about-scroll">
      <div ref={stageRef} className="about-stage">
        <div className="about-chrome">
          <span className="about-chrome-label">01 / About</span>
          <span className="about-chrome-hint">{step < PANEL_COUNT - 1 ? "Scroll ↓" : "Continue ↓"}</span>
        </div>

        <div className="about-steps" aria-label="About sections">
          {Array.from({ length: PANEL_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`about-step${step === i ? " is-active" : ""}`}
              aria-label={`Go to section ${i + 1}`}
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>

        {/* 0 — Intro */}
        <section className="about-panel" data-panel="0">
          <div className="about-panel-inner about-panel-intro">
            <span className="about-label" data-intro="label">
              {aboutIntro.label}
            </span>
            <h2 className="about-title" data-intro="title">
              {aboutIntro.title}
            </h2>
            <div className="about-body">
              {aboutIntro.paragraphs.map((p) => (
                <p key={p.slice(0, 28)} data-intro="p">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* 1 — Capabilities */}
        <section className="about-panel" data-panel="1">
          <div className="about-panel-inner">
            <div className="about-panel-head" data-cap-head>
              <span className="about-label">02 / Capabilities</span>
              <h3 className="about-heading">What I do</h3>
            </div>
            <div className="about-cap-grid">
              {capabilities.map((c) => (
                <article key={c.title} className="about-cap-item" data-cap-card>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 2 — Stack */}
        <section className="about-panel" data-panel="2">
          <div className="about-panel-inner about-panel-stack">
            <div className="about-panel-head" data-stack-head>
              <span className="about-label">03 / Stack</span>
              <h3 className="about-heading">Tools I build with</h3>
            </div>
            <div className="about-stack-groups">
              {stackGroups.map((group) => (
                <div key={group.title} className="about-stack-group" data-stack-group>
                  <h4 className="about-stack-group-title">{group.title}</h4>
                  <div className="about-stack-chips">
                    {group.tools.map((t) => (
                      <div key={t.slug} className="about-tool-chip" data-tool-chip>
                        {/* eslint-disable-next-line @next/next/no-img-element -- external icon CDN */}
                        <img
                          src={`https://cdn.simpleicons.org/${t.slug}`}
                          alt=""
                          width={22}
                          height={22}
                        />
                        <div>
                          <span className="name">{t.name}</span>
                          <span className="use">{t.use}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 — Path */}
        <section className="about-panel" data-panel="3">
          <div className="about-panel-inner about-panel-path">
            <div className="about-panel-head" data-path-head>
              <span className="about-label">04 / Experience</span>
              <h3 className="about-heading">Path so far</h3>
            </div>
            <ol className="about-timeline">
              {experience.map((item) => (
                <li key={item.period + item.title} data-path-item>
                  <span className="period">{item.period}</span>
                  <span className="title">{item.title}</span>
                  <span className="detail">{item.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4 — Personal + Currently */}
        <section className="about-panel" data-panel="4">
          <div className="about-panel-inner about-panel-personal">
            <div className="about-split">
              <div className="about-split-pane" data-personal-pane>
                <span className="about-label">05 / Personal</span>
                <h3 className="about-heading">{personal.title}</h3>
                <ul className="about-bullets">
                  {personal.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="about-split-pane about-split-accent" data-personal-pane>
                <span className="about-label">Currently</span>
                <ul className="about-bullets">
                  {personal.currently.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
