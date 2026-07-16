"use client";

import { useEffect, type RefObject } from "react";
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

type AboutSceneProps = {
  active: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ active, scrollRef }: AboutSceneProps) {
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(scroller.querySelectorAll("[data-about-card]"));
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            delay: Math.min(i * 0.03, 0.12),
            scrollTrigger: {
              scroller,
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      const chips = gsap.utils.toArray<HTMLElement>(scroller.querySelectorAll("[data-tool-chip]"));
      if (chips.length) {
        gsap.fromTo(
          chips,
          { autoAlpha: 0, y: 18, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: "power2.out",
            scrollTrigger: {
              scroller,
              trigger: scroller.querySelector("[data-stack-grid]"),
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, scroller);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [scrollRef]);

  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [active]);

  return (
    <div ref={scrollRef} className="about-scroll">
      <div className="about-flow">
        {/* Intro */}
        <article className="about-card about-card-intro" data-about-card>
          <span className="about-card-label">{aboutIntro.label}</span>
          <h2 className="about-card-title">{aboutIntro.title}</h2>
          <div className="about-card-body">
            {aboutIntro.paragraphs.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
        </article>

        {/* Capabilities */}
        <section className="about-card" data-about-card>
          <div className="about-card-head">
            <span className="about-card-label">02 / Capabilities</span>
            <h3 className="about-card-heading">What I do</h3>
          </div>
          <div className="about-cap-grid">
            {capabilities.map((c) => (
              <div key={c.title} className="about-cap-item">
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="about-card" data-about-card>
          <div className="about-card-head">
            <span className="about-card-label">03 / Stack</span>
            <h3 className="about-card-heading">Tools I build with</h3>
          </div>
          <div className="about-stack-groups" data-stack-grid>
            {stackGroups.map((group) => (
              <div key={group.title} className="about-stack-group">
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
        </section>

        {/* Experience */}
        <section className="about-card" data-about-card>
          <div className="about-card-head">
            <span className="about-card-label">04 / Experience</span>
            <h3 className="about-card-heading">Path so far</h3>
          </div>
          <ol className="about-timeline">
            {experience.map((item) => (
              <li key={item.period + item.title}>
                <span className="period">{item.period}</span>
                <span className="title">{item.title}</span>
                <span className="detail">{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Personal + Currently */}
        <section className="about-card about-card-split" data-about-card>
          <div className="about-split-pane">
            <span className="about-card-label">05 / Personal</span>
            <h3 className="about-card-heading">{personal.title}</h3>
            <ul className="about-bullets">
              {personal.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="about-split-pane about-split-accent">
            <span className="about-card-label">Currently</span>
            <ul className="about-bullets">
              {personal.currently.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
