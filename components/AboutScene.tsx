"use client";

import type { RefObject } from "react";
import Reveal from "./Reveal";
import { aboutIntro, capabilities, currently, experience } from "@/lib/about";

type AboutSceneProps = {
  revealed: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ revealed, scrollRef }: AboutSceneProps) {
  return (
    <div ref={scrollRef} className="about-scroll">
      <div className="about-inner">
        {/* About Me */}
        <section className="about-me">
          <div className="about-me-copy">
            <Reveal revealed={revealed} className="about-eyebrow">
              About
            </Reveal>
            <Reveal revealed={revealed} className="about-heading">
              Who I Am
            </Reveal>
            {aboutIntro.map((p) => (
              <Reveal key={p.slice(0, 24)} revealed={revealed} className="about-body">
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          <div className="about-me-visual">
            {/* eslint-disable-next-line @next/next/no-img-element -- character asset used as decorative scene art */}
            <img
              src="/hero-character.png"
              alt="Illustrated character with a laptop"
              className="about-char"
            />
          </div>
        </section>

        {/* Capabilities */}
        <section className="about-block">
          <Reveal revealed={revealed} className="about-heading">
            Capabilities
          </Reveal>
          <p className="about-lead">How I build — from interface to infrastructure.</p>
          <div className="cap-grid">
            {capabilities.map((c) => (
              <article key={c.title} className="cap-card">
                <h3 className="cap-title">{c.title}</h3>
                <p className="cap-body">{c.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="about-block">
          <Reveal revealed={revealed} className="about-heading">
            Experience
          </Reveal>
          <p className="about-lead">Education and the work I am building now.</p>
          <ol className="timeline">
            {experience.map((item) => (
              <li key={item.period + item.title} className="timeline-item">
                <span className="timeline-period">{item.period}</span>
                <span className="timeline-title">{item.title}</span>
                <span className="timeline-detail">{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Currently */}
        <section className="about-block about-currently">
          <Reveal revealed={revealed} className="about-heading">
            Currently
          </Reveal>
          <ul className="currently-list">
            {currently.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
